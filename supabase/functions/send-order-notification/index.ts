import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

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

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      orderId,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress,
      notes,
      totalAmount,
      items,
    }: OrderNotificationRequest = await req.json();

    console.log("Processing order notification:", orderId);

    // Build items list HTML
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.product_name}</td>
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
              <p>Заказ #${orderId.slice(0, 8)}</p>
            </div>
            
            <div class="content">
              <div class="order-info">
                <h3>📋 Информация о клиенте</h3>
                <p><strong>Имя:</strong> ${customerName}</p>
                <p><strong>Телефон:</strong> ${customerPhone}</p>
                ${customerEmail ? `<p><strong>Email:</strong> ${customerEmail}</p>` : ''}
                <p><strong>Адрес доставки:</strong> ${deliveryAddress}</p>
                ${notes ? `<p><strong>Комментарий:</strong> ${notes}</p>` : ''}
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
    
    // Send email to your business email
    const emailResponse = await resend.emails.send({
      from: "AFSONA Orders <onboarding@resend.dev>",
      to: [businessEmail],
      reply_to: customerEmail ? customerEmail : undefined,
      subject: `Новый заказ #${orderId.slice(0, 8)} от ${customerName}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ success: true, emailId: emailResponse.id }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-order-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
