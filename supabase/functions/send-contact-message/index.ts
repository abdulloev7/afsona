import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface ContactMessageRequest {
  name: string;
  phone: string;
  email?: string;
  message: string;
}

// Simple input validation
const validateInput = (data: ContactMessageRequest): { valid: boolean; error?: string } => {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length < 1 || data.name.length > 100) {
    return { valid: false, error: 'Имя обязательно для заполнения' };
  }
  if (!data.phone || typeof data.phone !== 'string' || data.phone.trim().length < 5 || data.phone.length > 50) {
    return { valid: false, error: 'Укажите корректный номер телефона' };
  }
  if (data.email && (typeof data.email !== 'string' || data.email.length > 255)) {
    return { valid: false, error: 'Некорректный email' };
  }
  if (!data.message || typeof data.message !== 'string' || data.message.trim().length < 1 || data.message.length > 2000) {
    return { valid: false, error: 'Сообщение обязательно для заполнения' };
  }
  return { valid: true };
};

// Escape HTML to prevent injection in email
const escapeHtml = (text: string): string => {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
};

const handler = async (req: Request): Promise<Response> => {
  console.log("send-contact-message: Starting request processing");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment configuration (without revealing values)
    console.log("BUSINESS_EMAIL configured:", !!Deno.env.get("BUSINESS_EMAIL"));
    console.log("RESEND_API_KEY configured:", !!Deno.env.get("RESEND_API_KEY"));

    const requestData: ContactMessageRequest = await req.json();
    
    // Validate input
    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { name, phone, email, message } = requestData;

    console.log("Processing contact message from:", name);

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #16a34a; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .info h3 { margin-top: 0; color: #16a34a; }
            .message-box { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #16a34a; margin-top: 15px; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Новое сообщение с сайта</h1>
            </div>
            
            <div class="content">
              <div class="info">
                <h3>📋 Контактная информация</h3>
                <p><strong>Имя:</strong> ${escapeHtml(name)}</p>
                <p><strong>Телефон:</strong> <a href="tel:${escapeHtml(phone)}">${escapeHtml(phone)}</a></p>
                ${email ? `<p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>` : ''}
              </div>

              <div class="message-box">
                <h3>💬 Сообщение</h3>
                <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
              </div>
            </div>

            <div class="footer">
              <p>Это сообщение отправлено через форму обратной связи на сайте AFSONA</p>
              <p>Свяжитесь с клиентом как можно скорее!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Get business email from environment
    const businessEmail = Deno.env.get("BUSINESS_EMAIL") || "afsonapaints@gmail.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Send email using fetch
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "AFSONA <onboarding@resend.dev>",
        to: [businessEmail],
        reply_to: email || undefined,
        subject: `Сообщение с сайта от ${name}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Email sending failed:", emailResult);
      return new Response(
        JSON.stringify({ error: "Не удалось отправить сообщение. Попробуйте позже." }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Contact message email sent successfully:", emailResult);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResult.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error("Error in send-contact-message function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "Произошла ошибка. Попробуйте позже." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
