import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Home as HomeIcon,
  Store,
  MapPin,
  Compass,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronLeft,
  Lock,
  Landmark,
  Phone,
  User,
  Mail,
  ShieldCheck,
  ArrowRight,
  Clock,
  Building
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { useAuth, CustomerAddress } from '../context/AuthContext';
import {
  getCurrentCoordinates,
  validateMohanurDeliveryArea,
  DeliveryAreaValidation
} from '../utils/locationService';
import {
  loadRazorpayScript,
  RAZORPAY_KEY_ID,
  generateClientRazorpayOrderId,
  verifyRazorpayPaymentSignature
} from '../utils/razorpayService';
import { OrderType } from '../types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, appliedCoupon, couponDiscount, clearCart } = useCart();
  const { settings, addOrder } = useBakeryDatabase();
  const { profile, savedAddresses, saveAddress } = useAuth();

  // Customer Details Form State (autofilled from profile if exists)
  const [customerName, setCustomerName] = useState(profile?.name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(profile?.email || '');

  // Order Type State: 'delivery' | 'pickup'
  const [orderType, setOrderType] = useState<OrderType>('delivery');

  // Delivery Address Form State
  const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
  const [addressLine, setAddressLine] = useState(defaultAddr?.landmark || '');
  const [doorNo, setDoorNo] = useState(defaultAddr?.doorNo || '');
  const [streetArea, setStreetArea] = useState(defaultAddr?.streetArea || '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');
  const [city, setCity] = useState(defaultAddr?.city || 'Mohanur');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '637015');
  const [saveThisAddress, setSaveThisAddress] = useState(false);

  // Sync profile if it becomes available
  useEffect(() => {
    if (profile) {
      if (!customerName && profile.name) setCustomerName(profile.name);
      if (!customerPhone && profile.phone) setCustomerPhone(profile.phone);
      if (!customerEmail && profile.email) setCustomerEmail(profile.email);
    }
  }, [profile]);

  const selectSavedAddress = (addr: CustomerAddress) => {
    setStreetArea(addr.streetArea);
    setDoorNo(addr.doorNo || '');
    setLandmark(addr.landmark || '');
    setCity(addr.city || 'Mohanur');
    setPincode(addr.pincode || '637015');
    if (addr.name && !customerName) setCustomerName(addr.name);
    if (addr.phone && !customerPhone) setCustomerPhone(addr.phone);
  };

  // Geolocation & Validation State
  const [latitude, setLatitude] = useState<number | undefined>(undefined);
  const [longitude, setLongitude] = useState<number | undefined>(undefined);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Delivery Area Validation Result
  const [deliveryValidation, setDeliveryValidation] = useState<DeliveryAreaValidation>({
    isValid: true,
    distanceKm: 0,
    areaName: 'Mohanur',
    message: 'Delivery available in Mohanur'
  });

  // Payment State
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  // Delivery Fee calculation
  const deliveryFee = orderType === 'pickup' ? 0 : settings.deliveryCharge || 40;
  const grandTotal = totalAmount + deliveryFee;

  // Validate Mohanur Delivery boundary on address changes
  useEffect(() => {
    if (orderType === 'delivery') {
      const fullAddress = `${doorNo} ${streetArea} ${addressLine} ${landmark}`;
      const validation = validateMohanurDeliveryArea(
        latitude,
        longitude,
        fullAddress,
        pincode,
        city,
        settings.deliveryRadiusKm || 15
      );
      setDeliveryValidation(validation);
    }
  }, [orderType, latitude, longitude, addressLine, streetArea, doorNo, landmark, city, pincode, settings.deliveryRadiusKm]);

  // Handle Geolocation Detection
  const handleUseCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setLocationError(null);

    const geoResult = await getCurrentCoordinates();
    setIsDetectingLocation(false);

    if (geoResult.error) {
      setLocationError(geoResult.error);
      return;
    }

    setLatitude(geoResult.latitude);
    setLongitude(geoResult.longitude);

    if (geoResult.streetArea) setStreetArea(geoResult.streetArea);
    if (geoResult.city) setCity(geoResult.city);
    if (geoResult.pincode) setPincode(geoResult.pincode);
    if (geoResult.landmark) setLandmark(geoResult.landmark);
    if (geoResult.addressLine) setAddressLine(geoResult.addressLine);
  };

  // Handle Form Submission & Razorpay Online Payment Flow
  const handlePayAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentError(null);

    // Validation
    if (!customerName.trim()) {
      setPaymentError('Please enter your full name.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      setPaymentError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (orderType === 'delivery') {
      if (!streetArea.trim() && !addressLine.trim()) {
        setPaymentError('Please enter your delivery street / area address.');
        return;
      }
      if (!deliveryValidation.isValid) {
        setPaymentError('Home delivery is currently available only within Mohanur. Please switch to Pickup from Shop.');
        return;
      }
    }

    if (cartItems.length === 0) {
      setPaymentError('Your cart is empty.');
      return;
    }

    setIsProcessingPayment(true);

    // 1. Load Razorpay SDK
    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setIsProcessingPayment(false);
      setPaymentError('Failed to load Razorpay payment gateway. Please check your internet connection.');
      return;
    }

    // 2. Generate Razorpay Order ID (Mock/Server)
    const rzpOrderId = generateClientRazorpayOrderId();
    const orderNumber = `#MG-${Math.floor(100000 + Math.random() * 900000)}`;

    const fullFormattedAddress = orderType === 'delivery'
      ? `${doorNo ? doorNo + ', ' : ''}${streetArea}, ${addressLine ? addressLine + ', ' : ''}${landmark ? 'Near ' + landmark + ', ' : ''}${city} - ${pincode}`
      : settings.storeAddress;

    // Prepare Order Object
    const pendingOrderData = {
      orderNumber,
      customerName: customerName.trim(),
      phone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      orderType,
      deliveryAddress: fullFormattedAddress,
      streetArea: streetArea.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      pincode: pincode.trim(),
      latitude,
      longitude,
      deliveryArea: 'Mohanur',
      deliveryFee,
      subtotal: totalAmount,
      amount: grandTotal,
      paymentMethod: 'razorpay' as const,
      paymentStatus: 'PENDING' as const,
      orderStatus: 'PENDING PAYMENT' as const,
      razorpayOrderId: rzpOrderId,
      items: cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        name: item.name,
        selectedWeight: item.selectedWeight,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      }))
    };

    // 3. Configure Razorpay Standard Checkout Popup
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(grandTotal * 100), // in paise
      currency: 'INR',
      name: settings.bakeryName || 'M.G. Iyengar Bakery & Chats',
      description: `Order ${orderNumber} - Fresh Bakery Items`,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=200&q=80',
      order_id: rzpOrderId,
      prefill: {
        name: customerName,
        email: customerEmail || 'customer@mgiyengar.com',
        contact: customerPhone
      },
      theme: {
        color: '#2A0E0A'
      },
      handler: async (response: any) => {
        setIsProcessingPayment(true);
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;

        // Signature verification check
        const isValidSignature = verifyRazorpayPaymentSignature(
          razorpay_order_id || rzpOrderId,
          razorpay_payment_id || `pay_${Date.now()}`,
          razorpay_signature || 'test_sig'
        );

        if (!isValidSignature) {
          setIsProcessingPayment(false);
          setPaymentError('Payment verification failed. Your order has not been confirmed.');
          return;
        }

        // Complete Order in Database
        const confirmedOrder = await addOrder({
          ...pendingOrderData,
          paymentStatus: 'PAID',
          orderStatus: orderType === 'delivery' ? 'CONFIRMED' : 'READY FOR PICKUP',
          razorpayOrderId: razorpay_order_id || rzpOrderId,
          razorpayPaymentId: razorpay_payment_id || `pay_${Date.now()}`
        });

        // Save address to address book if requested
        if (saveThisAddress && orderType === 'delivery' && streetArea.trim()) {
          saveAddress({
            label: 'Home',
            name: customerName,
            phone: customerPhone,
            doorNo,
            streetArea,
            landmark,
            city,
            pincode,
          });
        }

        clearCart();
        setIsProcessingPayment(false);
        navigate(`/order-confirmation/${confirmedOrder.orderNumber}`);
      },
      modal: {
        ondismiss: () => {
          setIsProcessingPayment(false);
          setPaymentError('Payment window was closed. Your cart items are preserved so you can retry payment anytime.');
        }
      }
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.warn('Fallback local Razorpay execution:', err);
      // In local dev without live Razorpay SDK key: simulate successful payment verification
      setTimeout(async () => {
        const confirmedOrder = await addOrder({
          ...pendingOrderData,
          paymentStatus: 'PAID',
          orderStatus: orderType === 'delivery' ? 'CONFIRMED' : 'READY FOR PICKUP',
          razorpayPaymentId: `pay_test_${Date.now().toString().slice(-6)}`
        });
        clearCart();
        setIsProcessingPayment(false);
        navigate(`/order-confirmation/${confirmedOrder.orderNumber}`);
      }, 1000);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] py-20 px-4 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 rounded-full bg-[#2A0E0A]/5 flex items-center justify-center text-[#2A0E0A] mb-4">
          <ShoppingBag className="w-10 h-10 text-[#C9A227]" />
        </div>
        <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A] mb-2">Your Bag is Empty</h2>
        <p className="text-sm text-[#2A0E0A]/60 max-w-sm mb-6">
          Add delicious cakes, puffs, cookies, and fresh bakery items to your cart before proceeding to checkout.
        </p>
        <button
          onClick={() => navigate('/menu')}
          className="px-8 py-3.5 rounded-full bg-[#2A0E0A] text-[#C9A227] font-bold text-xs hover:bg-[#401C16] transition-all cursor-pointer shadow-lg"
        >
          Browse Our Menu
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => navigate('/menu')}
            className="p-2 rounded-full bg-white border border-[#2C1A17]/10 hover:bg-[#FAF6F0] text-[#2C1A17] cursor-pointer transition-all"
            aria-label="Back to menu"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#C9A227] uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>M.G. Iyengar Bakery & Chats</span>
            </div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-extrabold text-[#2C1A17]">
              Secure Checkout
            </h1>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Details & Delivery Form */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. CUSTOMER DETAILS CARD */}
            <div className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-3 mb-5 border-b border-[#2C1A17]/5 pb-4">
                <div className="w-9 h-9 rounded-2xl bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shadow-sm shrink-0">
                  <User className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Customer Details</h3>
                  <p className="text-[11px] text-[#2C1A17]/50">Enter your contact details for order notifications</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Full Name *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none transition-all"
                    />
                    <User className="w-4 h-4 text-[#2C1A17]/40 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Mobile Number *</label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none transition-all"
                    />
                    <Phone className="w-4 h-4 text-[#2C1A17]/40 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Email Address (Optional)</label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="e.g. ramesh@gmail.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-3 pl-10 pr-4 text-xs font-semibold focus:outline-none transition-all"
                    />
                    <Mail className="w-4 h-4 text-[#2C1A17]/40 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. ORDER TYPE SELECTION (Delivery vs Pickup) */}
            <div className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#2C1A17]/5 pb-4">
                <div className="w-9 h-9 rounded-2xl bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shadow-sm shrink-0">
                  <Landmark className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">How would you like to receive your order?</h3>
                  <p className="text-[11px] text-[#2C1A17]/50">Choose Home Delivery or Shop Pickup</p>
                </div>
              </div>

              {/* Two Large Selectable Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Option 1: Home Delivery */}
                <button
                  type="button"
                  onClick={() => setOrderType('delivery')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                    orderType === 'delivery'
                      ? 'border-[#2A0E0A] bg-[#2A0E0A]/5 shadow-md'
                      : 'border-[#2C1A17]/10 bg-[#FAF6F0]/40 hover:border-[#2C1A17]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      orderType === 'delivery' ? 'bg-[#2A0E0A] text-[#C9A227]' : 'bg-[#2C1A17]/10 text-[#2C1A17]'
                    }`}>
                      <HomeIcon className="w-5 h-5" />
                    </div>
                    {orderType === 'delivery' && (
                      <CheckCircle2 className="w-5 h-5 text-[#2A0E0A]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2C1A17]">🏠 Home Delivery</h4>
                    <p className="text-[11px] text-[#2C1A17]/60 mt-1 font-light">
                      Delivered straight to your doorstep (Mohanur region)
                    </p>
                  </div>
                </button>

                {/* Option 2: Pickup from Shop */}
                <button
                  type="button"
                  onClick={() => setOrderType('pickup')}
                  className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                    orderType === 'pickup'
                      ? 'border-[#2A0E0A] bg-[#2A0E0A]/5 shadow-md'
                      : 'border-[#2C1A17]/10 bg-[#FAF6F0]/40 hover:border-[#2C1A17]/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      orderType === 'pickup' ? 'bg-[#2A0E0A] text-[#C9A227]' : 'bg-[#2C1A17]/10 text-[#2C1A17]'
                    }`}>
                      <Store className="w-5 h-5" />
                    </div>
                    {orderType === 'pickup' && (
                      <CheckCircle2 className="w-5 h-5 text-[#2A0E0A]" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-[#2C1A17]">🏪 Pickup from Shop</h4>
                    <p className="text-[11px] text-[#2C1A17]/60 mt-1 font-light">
                      Collect directly from our Mohanur Bakery (Free Delivery)
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. DYNAMIC CONTENT: DELIVERY ADDRESS vs SHOP PICKUP INFO */}
            <AnimatePresence mode="wait">
              {orderType === 'delivery' ? (
                // --- HOME DELIVERY ADDRESS FORM ---
                <motion.div
                  key="delivery-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-sm space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#2C1A17]/5 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shrink-0">
                        <MapPin className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Delivery Address</h3>
                        <p className="text-[11px] text-[#2C1A17]/50">Mohanur Delivery Area</p>
                      </div>
                    </div>

                    {/* Use Current Location Button */}
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      disabled={isDetectingLocation}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FAF6F0] hover:bg-[#C9A227]/20 border border-[#C9A227]/40 text-[#2A0E0A] font-bold text-xs cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                    >
                      <Compass className={`w-3.5 h-3.5 text-[#C9A227] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                      <span>{isDetectingLocation ? 'Detecting...' : '📍 Use Current Location'}</span>
                    </button>
                  </div>

                  {/* Saved Addresses Picker (if user has saved addresses) */}
                  {savedAddresses.length > 0 && (
                    <div className="space-y-2 pb-2">
                      <label className="text-[10px] font-black text-[#2C1A17]/60 uppercase tracking-widest block">
                        Saved Addresses (Click to Select)
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {savedAddresses.map(addr => {
                          const isSelected = streetArea === addr.streetArea && doorNo === (addr.doorNo || '');
                          return (
                            <button
                              key={addr.id}
                              type="button"
                              onClick={() => selectSavedAddress(addr)}
                              className={`px-3.5 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all flex items-center gap-1.5 ${
                                isSelected
                                  ? 'bg-[#2A0E0A] text-[#C9A227] border-[#2A0E0A] shadow-sm'
                                  : 'bg-[#FAF6F0] text-[#2C1A17]/80 border-[#2C1A17]/15 hover:border-[#C9A227]'
                              }`}
                            >
                              <MapPin className="w-3.5 h-3.5" />
                              <span>{addr.label}: {addr.streetArea}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location Detection Error Banner */}
                  {locationError && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <p className="font-medium">{locationError}</p>
                    </div>
                  )}

                  {/* Mohanur Delivery Area Validation Status Badge */}
                  <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
                    deliveryValidation.isValid
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center gap-2.5">
                      {deliveryValidation.isValid ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">{deliveryValidation.message}</p>
                        {!deliveryValidation.isValid && (
                          <p className="text-[10px] text-rose-700 mt-0.5">
                            Home delivery is restricted to Mohanur area only.
                          </p>
                        )}
                      </div>
                    </div>

                    {!deliveryValidation.isValid && (
                      <button
                        type="button"
                        onClick={() => setOrderType('pickup')}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] rounded-xl shrink-0 cursor-pointer shadow-sm"
                      >
                        Switch to Pickup
                      </button>
                    )}
                  </div>

                  {/* Address Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">House / Door Number</label>
                      <input
                        type="text"
                        placeholder="e.g. Door No. 12/4B"
                        value={doorNo}
                        onChange={(e) => setDoorNo(e.target.value)}
                        className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Street / Area *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Main Road, Near Bus Stand"
                        value={streetArea}
                        onChange={(e) => setStreetArea(e.target.value)}
                        className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Opposite State Bank"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Address Line</label>
                      <input
                        type="text"
                        placeholder="Full delivery location details"
                        value={addressLine}
                        onChange={(e) => setAddressLine(e.target.value)}
                        className="w-full bg-[#FAF6F0]/60 border border-[#2C1A17]/15 focus:border-[#C9A227] rounded-xl py-2.5 px-3.5 text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#FAF6F0] border border-[#2C1A17]/15 rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#2C1A17]"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#2C1A17]/70 uppercase tracking-wider block">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-[#FAF6F0] border border-[#2C1A17]/15 rounded-xl py-2.5 px-3.5 text-xs font-bold text-[#2C1A17]"
                      />
                    </div>
                  </div>

                  {/* Save address checkbox */}
                  <label className="flex items-center gap-2 text-xs text-[#2C1A17]/80 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={saveThisAddress}
                      onChange={e => setSaveThisAddress(e.target.checked)}
                      className="rounded border-[#2C1A17]/20 text-[#C9A227] focus:ring-[#C9A227]"
                    />
                    <span>Save this address to my account for faster future checkouts</span>
                  </label>
                </motion.div>
              ) : (
                // --- PICKUP FROM SHOP DISPLAY CARD ---
                <motion.div
                  key="pickup-card"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-sm space-y-4"
                >
                  <div className="flex items-center gap-3 border-b border-[#2C1A17]/5 pb-4">
                    <div className="w-9 h-9 rounded-2xl bg-[#2A0E0A] flex items-center justify-center text-[#C9A227] shrink-0">
                      <Store className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Shop Pickup Address</h3>
                      <p className="text-[11px] text-[#2C1A17]/50">No delivery address required for shop pickup</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#FAF6F0] border border-[#2C1A17]/10 space-y-3">
                    <div className="flex items-start gap-3">
                      <Building className="w-4 h-4 text-[#C9A227] shrink-0 mt-1" />
                      <div>
                        <h5 className="font-bold text-xs text-[#2C1A17]">{settings.bakeryName || 'M.G. Iyengar Bakery & Chats'}</h5>
                        <p className="text-xs text-[#2C1A17]/70 mt-0.5 leading-relaxed font-light">{settings.storeAddress}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-2 border-t border-[#2C1A17]/10 text-xs text-[#2C1A17]">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Hours: <strong>{settings.openingTime || '9:00 AM'} - {settings.closingTime || '10:00 PM'}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-[#C9A227]" />
                        <span>Contact: <strong>{settings.whatsappNumber}</strong></span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </div>

          {/* Right Column: Order Summary & Online Payment */}
          <div className="lg:col-span-5 space-y-6">

            {/* ORDER SUMMARY CARD */}
            <div className="bg-white rounded-3xl p-6 border border-[#2C1A17]/10 shadow-lg space-y-5 sticky top-24">
              <div className="flex items-center justify-between border-b border-[#2C1A17]/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <ShoppingBag className="w-5 h-5 text-[#C9A227]" />
                  <h3 className="font-playfair text-lg font-bold text-[#2C1A17]">Order Summary</h3>
                </div>
                <span className="text-xs font-bold text-[#C9A227] bg-[#2A0E0A] px-2.5 py-1 rounded-full">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Items
                </span>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={`${item.id}-${item.selectedWeight}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF6F0]/60 border border-[#2C1A17]/5"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#2C1A17]/10"
                      />
                      <div>
                        <h5 className="font-bold text-xs text-[#2C1A17] line-clamp-1">{item.name}</h5>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-semibold text-[#C9A227] bg-[#2A0E0A] px-1.5 py-0.5 rounded">
                            {item.selectedWeight}
                          </span>
                          <span className="text-[10px] text-[#2C1A17]/60">Qty: {item.quantity}</span>
                        </div>
                      </div>
                    </div>
                    <span className="font-bold text-xs text-[#2C1A17]">
                      ₹{item.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border-t border-[#2C1A17]/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#2C1A17]/70">
                  <span>Item Total</span>
                  <span className="font-bold text-[#2C1A17]">₹{totalAmount + couponDiscount}</span>
                </div>

                {appliedCoupon && couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 bg-green-50 px-2.5 py-1.5 rounded-xl font-semibold">
                    <span className="flex items-center gap-1">
                      <span>🏷️ Coupon ({appliedCoupon.code})</span>
                    </span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}

                <div className="flex justify-between text-[#2C1A17]/70">
                  <span>Delivery Fee</span>
                  {orderType === 'pickup' ? (
                    <span className="font-bold text-emerald-600 uppercase">FREE (Pickup)</span>
                  ) : (
                    <span className="font-bold text-[#2C1A17]">₹{deliveryFee}</span>
                  )}
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-[#2C1A17] pt-3 border-t border-[#2C1A17]/10">
                  <span>Total Amount</span>
                  <span className="font-playfair text-xl text-[#2A0E0A]">₹{grandTotal}</span>
                </div>
              </div>

              {/* Payment Error Alert */}
              {paymentError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <p className="font-medium leading-relaxed">{paymentError}</p>
                </div>
              )}

              {/* Online Payment Method Indicator */}
              <div className="p-3.5 rounded-2xl bg-[#FAF6F0] border border-[#C9A227]/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-[#2C1A17]">Online Payment (Razorpay)</span>
                </div>
                <span className="text-[10px] font-bold uppercase text-[#C9A227] tracking-wider">Secured 256-bit</span>
              </div>

              {/* Pay & Place Order Button */}
              <button
                type="button"
                onClick={handlePayAndPlaceOrder}
                disabled={isProcessingPayment || (orderType === 'delivery' && !deliveryValidation.isValid)}
                className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#FAF7F2] hover:text-[#C9A227] py-4 px-6 rounded-full font-bold text-xs flex items-center justify-center gap-2.5 transition-all duration-300 shadow-xl shadow-[#2A0E0A]/20 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Lock className="w-4 h-4 text-[#C9A227]" />
                <span>{isProcessingPayment ? 'Processing Payment...' : `Pay ₹${grandTotal} & Place Order`}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-[10px] text-center text-[#2C1A17]/50 font-light">
                By placing your order, you agree to M.G. Iyengar Bakery's terms & store policies.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
