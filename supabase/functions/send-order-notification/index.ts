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
  selected_size: string | null;
}

// Orders older than this can't re-trigger an email (the order id is the only input)
const MAX_ORDER_AGE_MS = 15 * 60 * 1000;

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

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });

const handler = async (req: Request): Promise<Response> => {
  console.log("send-order-notification: Starting request processing");
  
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log environment configuration (without revealing values)
    console.log("BUSINESS_EMAIL configured:", !!Deno.env.get("BUSINESS_EMAIL"));
    console.log("RESEND_API_KEY configured:", !!Deno.env.get("RESEND_API_KEY"));

    // Guests can order too, so there is no user session to check. Everything in the
    // email is read from the database by order id; nothing from the request body is trusted.
    const { orderId } = await req.json();
    if (!orderId || typeof orderId !== 'string' || orderId.length > 100) {
      return jsonResponse({ error: 'Invalid orderId' }, 400);
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { data: order, error: orderError } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, customer_name, customer_phone, customer_email, delivery_address, notes, total_amount, order_items(quantity, price, selected_size, product:products(name))')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      return jsonResponse({ error: 'Order not found' }, 404);
    }

    if (Date.now() - new Date(order.created_at).getTime() > MAX_ORDER_AGE_MS) {
      return jsonResponse({ error: 'Order is too old to notify' }, 409);
    }

    const customerName: string = order.customer_name;
    const customerPhone: string = order.customer_phone;
    const customerEmail: string | null = order.customer_email;
    const deliveryAddress: string = order.delivery_address;
    const notes: string | null = order.notes;
    const totalAmount = Number(order.total_amount);
    const items: OrderItem[] = (order.order_items ?? []).map((item: any) => ({
      product_name: item.product?.name ?? 'Товар',
      quantity: item.quantity,
      price: Number(item.price),
      selected_size: item.selected_size,
    }));

    console.log("Processing order notification for order:", orderId);

    // Build items list HTML with escaped content
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${escapeHtml(item.product_name)}${item.selected_size ? ` (${escapeHtml(item.selected_size)})` : ''}</td>
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
