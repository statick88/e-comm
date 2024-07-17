import React, { useRef } from 'react';
import { AiOutlineMinus, AiOutlinePlus, AiOutlineShopping } from 'react-icons/ai';
import { HiOutlineTrash } from 'react-icons/hi';
import toast from 'react-hot-toast';
import { useStateContext } from '../context/StateContext';
import { urlFor } from '../lib/client';
import getStripe from '../lib/getStripe';

const Cart = () => {
  const cartRef = useRef();
  const { cartItems, totalPrice, totalQty, onRemove, toggleCartItemQuantity } = useStateContext();

  const handleCheckout = async () => {
    const stripe = await getStripe();

    try {
      const response = await fetch('/api/stripe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cartItems),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const sessionData = await response.json();
      toast.loading('Redirecting to checkout...');

      stripe.redirectToCheckout({ sessionId: sessionData.id });
    } catch (error) {
      console.error('Error creating Stripe session:', error);

      // Log the detailed error received from Stripe
      if (error.response) {
        console.error('Stripe Error Response:', error.response.data);
      }

      toast.error('Failed to initiate checkout. Please try again.');
    }
  };

  return (
    <div className='cart-wrapper' ref={cartRef}>
      <h2>Shopping Cart</h2>
      <div className='cart-container'>
        {cartItems.length < 1 ? (
          <div className='empty-cart'>
            <AiOutlineShopping size={150} />
            <h1>Your shopping bag is empty</h1>
          </div>
        ) : (
          <>
            <div className='cart-items'>
              {cartItems.map((item) => (
                <div key={item._id} className='item-card'> {/* Use a unique identifier like item._id */}
                  <div className='item-image'>
                    <img src={urlFor(item?.image[0])} alt='Product' />
                  </div>
                  <div className='item-details'>
                    <div className='name-and-remove'>
                      <h3>{item.name}</h3>
                      <button type='button' onClick={() => onRemove(item)} className='remove-item'>
                        <HiOutlineTrash size={28} />
                      </button>
                    </div>
                    <p className='item-tag'>Dress</p>
                    <p className='delivery-est'>Delivery Estimation</p>
                    <p className='delivery-days'>5 Working Days</p>
                    <div className='price-and-qty'>
                      <span className='price'>${item.price * item.quantity}</span>
                      <div>
                        <span className='minus' onClick={() => toggleCartItemQuantity(item._id, 'dec')}>
                          <AiOutlineMinus />
                        </span>
                        <span className='num'>{item.quantity}</span>
                        <span className='plus' onClick={() => toggleCartItemQuantity(item._id, 'inc')}>
                          <AiOutlinePlus />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className='order-summary'>
              <h3>Order Summary</h3>
              <div className='qty'>
                <p>Quantity</p>
                <span>{totalQty} Product</span>
              </div>
              <div className='subtotal'>
                <p>Sub Total</p>
                <span>${totalPrice}</span>
              </div>
              <div>
                <button className='btn' type='button' onClick={handleCheckout}>
                  Process to Checkout
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
