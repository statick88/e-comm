import Stripe from 'stripe';
import { urlFor } from '../../lib/client'; // Asegúrate de importar urlFor correctamente

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2020-08-27', // Asegúrate de usar una versión actualizada de la API de Stripe
});

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      // Mapea los elementos del carrito a line_items de Stripe
      const lineItems = req.body.map((item) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name,
            images: [urlFor(item?.image[0])], // Asegúrate de que urlFor resuelva correctamente la URL
          },
          unit_amount: item.price * 100,
        },
        quantity: item.quantity,
      }));

      // Crea la sesión de Stripe
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/successPay`,
        cancel_url: `${req.headers.origin}/canceled`,
      });

      // Devuelve el ID de la sesión creada
      res.status(200).json({ id: session.id });
    } catch (err) {
      console.error('Error creating Stripe session:', err);
      res.status(err.statusCode || 500).json({ message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
