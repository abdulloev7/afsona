import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  product_name: string;
  quantity: number;
  price: number;
}

interface OrderNotificationRequest {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress: string;
  notes?: string;
  totalAmount: number;
  items: OrderItem[];
}

// Simple input validation
const validateInput = (data: OrderNotificationRequest): { valid: boolean; error?: string } => {
  if (!data.orderId || typeof data.orderId !== 'string' || data.orderId.length < 1 || data.orderId.length > 100) {
    return { valid: false, error: 'Invalid orderId' };
  }
  if (!data.customerName || typeof data.customerName !== 'string' || data.customerName.length > 200) {
    return { valid: false, error: 'Invalid customerName' };
  }
  if (!data.customerPhone || typeof data.customerPhone !== 'string' || data.customerPhone.length > 50) {
    return { valid: false, error: 'Invalid customerPhone' };
  }
  if (data.customerEmail && (typeof data.customerEmail !== 'string' || data.customerEmail.length > 255)) {
    return { valid: false, error: 'Invalid customerEmail' };
  }
  if (!data.deliveryAddress || typeof data.deliveryAddress !== 'string' || data.deliveryAddress.length > 500) {
    return { valid: false, error: 'Invalid deliveryAddress' };
  }
  if (data.notes && (typeof data.notes !== 'string' || data.notes.length > 1000)) {
    return { valid: false, error: 'Invalid notes' };
  }
  if (typeof data.totalAmount !== 'number' || data.totalAmount < 0) {
    return { valid: false, error: 'Invalid totalAmount' };
  }
  if (!Array.isArray(data.items) || data.items.length === 0 || data.items.length > 100) {
    return { valid: false, error: 'Invalid items' };
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
  console.log("send-order-notification: Starting request processing");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment configuration (without revealing values)
    console.log("BUSINESS_EMAIL configured:", !!Deno.env.get("BUSINESS_EMAIL"));
    console.log("RESEND_API_KEY configured:", !!Deno.env.get("RESEND_API_KEY"));
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error("Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user authentication using getUser()
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = user.id;
    console.log("User authenticated successfully:", userId);

    const requestData: OrderNotificationRequest = await req.json();
    
    // Validate input
    const validation = validateInput(requestData);
    if (!validation.valid) {
      return new Response(
        JSON.stringify({ error: validation.error }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      notes,
      totalAmount,
      items,
    } = requestData;

    // Verify order exists and belongs to the authenticated user
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .select('user_id, id')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return new Response(
        JSON.stringify({ error: 'Order not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (order.user_id !== userId) {
      return new Response(
        JSON.stringify({ error: 'Forbidden' }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Processing order notification for order:", orderId);

    // Build items list HTML with escaped content
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.product_name)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toLocaleString('ru-RU')} сом.</td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toLocaleString('ru-RU')} сом.</td>
        </tr>
      `
      )
      .join("");

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f9fafb; padding: 20px; }
            .order-info { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
            .order-info h3 { margin-top: 0; color: #2563eb; }
            table { width: 100%; border-collapse: collapse; background: white; }
            th { background: #f3f4f6; padding: 10px; text-align: left; }
            .total { font-size: 1.2em; font-weight: bold; color: #2563eb; margin-top: 15px; text-align: right; }
            .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 0.9em; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Новый заказ!</h1>
              <p>Заказ #${escapeHtml(orderId.slice(0, 8))}</p>
            </div>
            
            <div class="content">
              <div class="order-info">
                <h3>📋 Информация о клиенте</h3>
                <p><strong>Имя:</strong> ${escapeHtml(customerName)}</p>
                <p><strong>Телефон:</strong> ${escapeHtml(customerPhone)}</p>
                ${customerEmail ? `<p><strong>Email:</strong> ${escapeHtml(customerEmail)}</p>` : ''}
                <p><strong>Адрес доставки:</strong> ${escapeHtml(deliveryAddress)}</p>
                ${notes ? `<p><strong>Комментарий:</strong> ${escapeHtml(notes)}</p>` : ''}
              </div>

              <div class="order-info">
                <h3>🛒 Состав заказа</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th style="text-align: center;">Кол-во</th>
                      <th style="text-align: right;">Цена</th>
                      <th style="text-align: right;">Сумма</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
                <div class="total">
                  Итого: ${totalAmount.toLocaleString('ru-RU')} сом.
                </div>
              </div>
            </div>

            <div class="footer">
              <p>Это автоматическое уведомление от AFSONA</p>
              <p>Свяжитесь с клиентом как можно скорее!</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Get business email from environment or use default
    const businessEmail = Deno.env.get("BUSINESS_EMAIL") || "your-email@example.com";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Send email using fetch instead of npm import (Deno-native approach)
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "AFSONA Orders <onboarding@resend.dev>",
        to: [businessEmail],
        reply_to: customerEmail ? customerEmail : undefined,
        subject: `Новый заказ #${orderId.slice(0, 8)} от ${customerName}`,
        html: emailHtml,
      }),
    });

    const emailResult = await emailResponse.json();
    
    if (!emailResponse.ok) {
      console.error("Email sending failed:", emailResult);
      return new Response(
        JSON.stringify({ error: "Failed to send email notification" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Email sent successfully:", emailResult);

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
    console.error("Error in send-order-notification function:", errorMessage);
    return new Response(
      JSON.stringify({ error: "An error occurred processing the request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
