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
  ChevronLeft,
  MessageCircle,
  Landmark,
  User,
  ArrowRight,
  Clock,
  Building,
  Lock
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useBakeryDatabase } from '../context/DatabaseContext';
import { useAuth, CustomerAddress } from '../context/AuthContext';
import {
  getCurrentCoordinates,
  validateMohanurDeliveryArea,
  DeliveryAreaValidation
} from '../utils/locationService';
import { generateOrderWhatsAppUrl, WhatsAppOrderItem } from '../utils/whatsappHelper';
import { OrderType } from '../types';

export const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, couponDiscount, clearCart } = useCart();
  const { settings, addOrder } = useBakeryDatabase();
  const {
    profile, user, savedAddresses, saveAddress,
    setIsAuthModalOpen, setAuthModalTab, setAuthModalMessage
  } = useAuth();

  // Customer Details (automatically sourced from authenticated profile)
  const activeName = profile?.name || profile?.full_name || (user?.user_metadata as any)?.full_name || (user?.user_metadata as any)?.name || '';
  const activePhone = profile?.phone || (user?.user_metadata as any)?.phone || '';
  const activeEmail = profile?.email || user?.email || '';

  const [customerName, setCustomerName] = useState(activeName);
  const [customerPhone, setCustomerPhone] = useState(activePhone);
  const [customerEmail, setCustomerEmail] = useState(activeEmail);

  // Order Type State: 'delivery' | 'pickup'
  const [orderType, setOrderType] = useState<OrderType>('delivery');

  // Delivery Address Form State
  const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
  const [selectedSavedAddr, setSelectedSavedAddr] = useState<CustomerAddress | null>(defaultAddr || null);
  const [useManualAddress, setUseManualAddress] = useState(!defaultAddr);
  const [addressLine, setAddressLine] = useState(defaultAddr?.landmark || '');
  const [doorNo, setDoorNo] = useState(defaultAddr?.doorNo || '');
  const [streetArea, setStreetArea] = useState(defaultAddr?.streetArea || '');
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || '');
  const [city, setCity] = useState(defaultAddr?.city || 'Mohanur');
  const [pincode, setPincode] = useState(defaultAddr?.pincode || '637015');
  const [saveThisAddress, setSaveThisAddress] = useState(false);

  // Sync profile immediately whenever profile or user loads
  useEffect(() => {
    if (profile || user) {
      const n = profile?.name || profile?.full_name || (user?.user_metadata as any)?.full_name || (user?.user_metadata as any)?.name || '';
      const p = profile?.phone || (user?.user_metadata as any)?.phone || '';
      const e = profile?.email || user?.email || '';
      if (n && !customerName) setCustomerName(n);
      if (p && !customerPhone) setCustomerPhone(p);
      if (e && !customerEmail) setCustomerEmail(e);
    }
  }, [profile, user, customerName, customerPhone, customerEmail]);

  // Sync saved addresses
  useEffect(() => {
    const def = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
    if (def && !selectedSavedAddr) {
      setSelectedSavedAddr(def);
      setUseManualAddress(false);
      setStreetArea(def.streetArea);
      setDoorNo(def.doorNo || '');
      setLandmark(def.landmark || '');
      setCity(def.city || 'Mohanur');
      setPincode(def.pincode || '637015');
    }
  }, [savedAddresses]);

  const selectSavedAddress = (addr: CustomerAddress) => {
    setSelectedSavedAddr(addr);
    setUseManualAddress(false);
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

  // Order Processing State
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<{ orderNumber: string; orderId: string } | null>(null);

  // Delivery Fee calculation
  const deliveryFee = orderType === 'pickup' ? 0 : (settings.deliveryCharge || 40);
  const grandTotal = totalAmount - (couponDiscount || 0) + deliveryFee;

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
    setUseManualAddress(true);
    setSelectedSavedAddr(null);

    if (geoResult.streetArea) setStreetArea(geoResult.streetArea);
    if (geoResult.city) setCity(geoResult.city);
    if (geoResult.pincode) setPincode(geoResult.pincode);
    if (geoResult.landmark) setLandmark(geoResult.landmark);
    if (geoResult.addressLine) setAddressLine(geoResult.addressLine);
  };

  // Handle Place Order → Supabase → WhatsApp
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    // 1. Require login
    if (!user) {
      setAuthModalMessage('Please sign in or create an account to place your order. Your cart will be preserved.');
      setAuthModalTab('login');
      setIsAuthModalOpen(true);
      return;
    }

    // 2. Resolve customer details automatically from authenticated profile
    const resolvedName = (customerName || activeName || profile?.name || profile?.full_name || (user?.user_metadata as any)?.full_name || 'Bakery Customer').trim();
    const resolvedPhone = (customerPhone || activePhone || profile?.phone || (user?.user_metadata as any)?.phone || '').trim();
    const resolvedEmail = (customerEmail || activeEmail || profile?.email || user.email || '').trim();

    if (!resolvedPhone || resolvedPhone.replace(/\D/g, '').length < 10) {
      setOrderError('Please provide a valid 10-digit mobile number for your order.');
      return;
    }

    // 3. Validate address for delivery
    if (orderType === 'delivery') {
      if (!streetArea.trim() && !addressLine.trim()) {
        setOrderError('Please enter your delivery street / area address.');
        return;
      }
      if (!deliveryValidation.isValid) {
        setOrderError('Home delivery is currently available only within Mohanur. Please switch to Pickup from Shop or enter a Mohanur address.');
        return;
      }
    }

    // 4. Validate cart
    if (cartItems.length === 0) {
      setOrderError('Your cart is empty. Please add some items first.');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // 5. Build address string
      const fullFormattedAddress = orderType === 'delivery'
        ? [doorNo, streetArea, addressLine && `Near ${addressLine}`, landmark && `Landmark: ${landmark}`, city, pincode ? `Pincode: ${pincode}` : '']
            .filter(Boolean).join(', ')
        : settings.storeAddress || 'M.G. Iyengar Bakery & Chats, Mohanur';

      // 6. Build order number (will use Supabase sequence via DB or fallback)
      const orderNumber = `MG-${Date.now().toString().slice(-6)}`;

      // 7. Build order items with customizations and unit price snapshot
      const orderItems = cartItems.map(item => ({
        productId: item.id,
        productName: item.name,
        name: item.name,
        selectedWeight: item.selectedWeight,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customizations: item.customizations || {},
      }));

      // 8. Save order to Supabase (this is the source of truth)
      const savedOrder = await addOrder({
        orderNumber,
        userId: user.id,
        customerName: resolvedName,
        phone: resolvedPhone,
        customerEmail: resolvedEmail || undefined,
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
        paymentMethod: 'whatsapp' as any,
        paymentStatus: 'PENDING' as any,
        orderStatus: 'ORDER_PLACED' as any,
        items: orderItems,
      });

      // 9. Save address if requested
      if (saveThisAddress && orderType === 'delivery' && streetArea.trim()) {
        await saveAddress({
          label: 'Home',
          name: resolvedName,
          phone: resolvedPhone,
          doorNo: doorNo.trim(),
          streetArea: streetArea.trim(),
          landmark: landmark.trim(),
          city: city.trim(),
          pincode: pincode.trim(),
          isDefault: savedAddresses.length === 0,
        });
      }

      // 10. Build WhatsApp message items
      const whatsappItems: WhatsAppOrderItem[] = cartItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        selectedWeight: item.selectedWeight,
        customizations: item.customizations,
      }));

      // 11. Generate WhatsApp URL
      const whatsappPhone = (settings.whatsappNumber || '919345586112').replace(/[^0-9]/g, '');
      const whatsappUrl = generateOrderWhatsAppUrl(
        orderNumber,
        resolvedName,
        resolvedPhone,
        orderType,
        orderType === 'delivery' ? fullFormattedAddress : undefined,
        whatsappItems,
        totalAmount,
        deliveryFee,
        grandTotal,
        whatsappPhone
      );

      // 12. Clear cart AFTER successful order save
      clearCart();

      // 13. Store success state
      setOrderSuccess({ orderNumber, orderId: savedOrder.id });

      // 14. Open WhatsApp
      try {
        window.open(whatsappUrl, '_blank');
      } catch {
        // WhatsApp couldn't be opened — order is already saved
        console.warn('Could not open WhatsApp');
      }

      // 15. Navigate to order confirmation
      navigate(`/order-confirmation/${savedOrder.id}?orderNumber=${encodeURIComponent(orderNumber)}&whatsapp=${encodeURIComponent(whatsappUrl)}`);

    } catch (err: any) {
      console.error('Order placement error:', err);
      setOrderError('Failed to place your order. Please try again. If the problem persists, contact us on WhatsApp.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Redirect to home if cart is empty (and no success)
  if (cartItems.length === 0 && !orderSuccess && !isPlacingOrder) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] pt-[92px] lg:pt-[96px] pb-24 px-4 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="w-20 h-20 rounded-full bg-[#2A0E0A]/8 flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="w-10 h-10 text-[#2A0E0A]/30" />
          </div>
          <h2 className="font-playfair text-2xl font-bold text-[#2A0E0A] mb-2">Your Cart is Empty</h2>
          <p className="text-sm text-[#2C1A17]/60 mb-6">Add some delicious bakery items to place an order.</p>
          <button
            onClick={() => navigate('/menu')}
            className="bg-[#2A0E0A] text-[#C9A227] font-bold py-3 px-8 rounded-full text-sm hover:bg-[#401C16] transition-all cursor-pointer"
          >
            Browse Menu
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[92px] lg:pt-[96px] pb-32 lg:pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="py-6 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-[#2A0E0A]/8 flex items-center justify-center hover:bg-[#2A0E0A]/15 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 text-[#2A0E0A]" />
          </button>
          <div>
            <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2A0E0A]">Checkout</h1>
            <p className="text-xs text-[#2C1A17]/50 mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in your order</p>
          </div>
        </div>

        {/* ── Auth Banner (if not logged in) ───────────────────────────────────── */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-5 bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Login required to place order</p>
                <p className="text-xs text-amber-700/80 mt-0.5">Your cart items are saved. Sign in to continue.</p>
              </div>
            </div>
            <div className="flex gap-2 self-end sm:self-auto shrink-0">
              <button
                onClick={() => {
                  setAuthModalMessage('Sign in to place your order. Your cart is safe!');
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs font-bold text-amber-800 border border-amber-400 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-all cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthModalMessage('Create an account to place your order. It only takes a minute!');
                  setAuthModalTab('signup');
                  setIsAuthModalOpen(true);
                }}
                className="text-xs font-bold text-white bg-amber-600 px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-all cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </motion.div>
        )}

        <form onSubmit={handlePlaceOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">

            {/* ── LEFT COLUMN ─────────────────────────────────────────────────────── */}
            <div className="space-y-5">

              {/* ─── CUSTOMER DETAILS (AUTOMATICALLY FROM PROFILE - NO REPEATED INPUTS) ─── */}
              <div className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#2C1A17]/8 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-[#2A0E0A] flex items-center justify-center">
                      <User className="w-4 h-4 text-[#C9A227]" />
                    </div>
                    <h2 className="font-semibold text-[#2A0E0A] text-sm">Customer Information</h2>
                  </div>
                  {user ? (
                    <span className="text-[11px] text-green-700 font-semibold bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                      Verified Profile
                    </span>
                  ) : (
                    <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Account Required
                    </span>
                  )}
                </div>

                {user ? (
                  <div className="p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#2C1A17]/8">
                        <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Customer Name</span>
                        <p className="font-bold text-sm text-[#2A0E0A] mt-1 truncate">
                          {customerName || activeName || 'Customer'}
                        </p>
                      </div>
                      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#2C1A17]/8">
                        <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Mobile Number</span>
                        <p className="font-bold text-sm text-[#2A0E0A] mt-1">
                          {customerPhone || activePhone || '—'}
                        </p>
                      </div>
                      <div className="bg-[#FAF7F2] p-3.5 rounded-xl border border-[#2C1A17]/8">
                        <span className="text-[10px] font-bold text-[#2C1A17]/50 uppercase tracking-wider block">Email</span>
                        <p className="font-medium text-xs text-[#2A0E0A] mt-1 truncate">
                          {customerEmail || activeEmail || user.email || '—'}
                        </p>
                      </div>
                    </div>
                    <p className="text-[11px] text-green-700 font-medium mt-3 flex items-center gap-1.5">
                      <span>✓ Saved customer information automatically applied.</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-3">
                    <p className="text-sm font-semibold text-[#2A0E0A]">
                      Sign in or create an account to proceed to checkout
                    </p>
                    <p className="text-xs text-[#2C1A17]/60 max-w-sm mx-auto">
                      Your name and mobile number will be automatically saved so you never have to re-enter them again.
                    </p>
                    <div className="flex justify-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMessage('Sign in to continue checkout with saved customer details.');
                          setAuthModalTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl border border-[#2A0E0A] text-[#2A0E0A] font-bold text-xs hover:bg-[#2A0E0A]/5 transition-all cursor-pointer"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthModalMessage('Create your account once. We will never ask for your name again.');
                          setAuthModalTab('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#2A0E0A] text-[#C9A227] font-bold text-xs hover:bg-[#401C16] transition-all cursor-pointer shadow-sm"
                      >
                        Create Account
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* ─── DELIVERY METHOD ───────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#2C1A17]/8 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#2A0E0A] flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <h2 className="font-semibold text-[#2A0E0A] text-sm">Delivery Method</h2>
                </div>
                <div className="p-5">
                  <div className="grid grid-cols-2 gap-3">
                    {/* Home Delivery */}
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        orderType === 'delivery'
                          ? 'border-[#C9A227] bg-[#C9A227]/8'
                          : 'border-[#2C1A17]/15 hover:border-[#C9A227]/40'
                      }`}
                    >
                      {orderType === 'delivery' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C9A227] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <HomeIcon className={`w-7 h-7 mb-2 ${orderType === 'delivery' ? 'text-[#C9A227]' : 'text-[#2C1A17]/40'}`} />
                      <p className="font-bold text-sm text-[#2A0E0A]">Home Delivery</p>
                      <p className="text-[11px] text-[#2C1A17]/50 mt-0.5">Within Mohanur only</p>
                      {deliveryFee > 0 && (
                        <p className="text-[11px] font-bold text-[#C9A227] mt-1">+₹{deliveryFee}</p>
                      )}
                    </button>

                    {/* Pickup */}
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`relative p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                        orderType === 'pickup'
                          ? 'border-[#C9A227] bg-[#C9A227]/8'
                          : 'border-[#2C1A17]/15 hover:border-[#C9A227]/40'
                      }`}
                    >
                      {orderType === 'pickup' && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-[#C9A227] flex items-center justify-center">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                      <Store className={`w-7 h-7 mb-2 ${orderType === 'pickup' ? 'text-[#C9A227]' : 'text-[#2C1A17]/40'}`} />
                      <p className="font-bold text-sm text-[#2A0E0A]">Pickup from Shop</p>
                      <p className="text-[11px] text-[#2C1A17]/50 mt-0.5">Free pickup, no delivery fee</p>
                      <p className="text-[11px] font-bold text-green-600 mt-1">FREE</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* ─── DELIVERY ADDRESS (shown only for delivery) ─────────────────── */}
              <AnimatePresence>
                {orderType === 'delivery' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm"
                  >
                    <div className="px-5 py-4 border-b border-[#2C1A17]/8 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#2A0E0A] flex items-center justify-center">
                        <Building className="w-4 h-4 text-[#C9A227]" />
                      </div>
                      <h2 className="font-semibold text-[#2A0E0A] text-sm">Delivery Address</h2>
                    </div>

                    <div className="p-5 space-y-4">
                      {/* Saved Addresses (for logged-in users) */}
                      {savedAddresses.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-[11px] font-bold text-[#2C1A17]/50 uppercase tracking-wider">Saved Addresses</p>
                          <div className="space-y-2">
                            {savedAddresses.map(addr => (
                              <button
                                key={addr.id}
                                type="button"
                                onClick={() => selectSavedAddress(addr)}
                                className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                  selectedSavedAddr?.id === addr.id && !useManualAddress
                                    ? 'border-[#C9A227] bg-[#C9A227]/8'
                                    : 'border-[#2C1A17]/10 hover:border-[#C9A227]/30'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${selectedSavedAddr?.id === addr.id && !useManualAddress ? 'text-[#C9A227]' : 'text-[#2C1A17]/30'}`} />
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs font-bold text-[#2A0E0A]">{addr.label}</span>
                                      {addr.isDefault && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-semibold">Default</span>}
                                    </div>
                                    <p className="text-xs text-[#2C1A17]/60 mt-0.5">
                                      {[addr.doorNo, addr.streetArea, addr.city, addr.pincode].filter(Boolean).join(', ')}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => { setUseManualAddress(true); setSelectedSavedAddr(null); }}
                              className={`w-full text-left p-3 rounded-xl border-2 transition-all cursor-pointer ${
                                useManualAddress
                                  ? 'border-[#C9A227] bg-[#C9A227]/8'
                                  : 'border-dashed border-[#2C1A17]/20 hover:border-[#C9A227]/40'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#2C1A17]/30" />
                                <span className="text-xs font-semibold text-[#2C1A17]/60">+ Enter a new address</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Location Detection */}
                      {(useManualAddress || savedAddresses.length === 0) && (
                        <div>
                          <button
                            type="button"
                            onClick={handleUseCurrentLocation}
                            disabled={isDetectingLocation}
                            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-dashed border-[#C9A227]/50 text-[#C9A227] text-xs font-semibold hover:bg-[#C9A227]/8 transition-all disabled:opacity-60 cursor-pointer"
                          >
                            <Compass className={`w-4 h-4 ${isDetectingLocation ? 'animate-spin' : ''}`} />
                            {isDetectingLocation ? 'Detecting Location…' : '📍 Use Current Location'}
                          </button>
                          {locationError && (
                            <p className="text-[11px] text-red-500 mt-1.5 px-1">{locationError}</p>
                          )}
                        </div>
                      )}

                      {/* Manual Address Fields */}
                      {(useManualAddress || savedAddresses.length === 0) && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[#2C1A17]/60 uppercase tracking-wider">Door / Flat No.</label>
                              <input
                                type="text"
                                value={doorNo}
                                onChange={e => setDoorNo(e.target.value)}
                                placeholder="e.g. 12A"
                                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[#2C1A17]/60 uppercase tracking-wider">Pincode</label>
                              <input
                                type="text"
                                value={pincode}
                                onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="637015"
                                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-bold text-[#2C1A17]/60 uppercase tracking-wider">Street / Area *</label>
                            <input
                              type="text"
                              required={orderType === 'delivery'}
                              value={streetArea}
                              onChange={e => setStreetArea(e.target.value)}
                              placeholder="e.g. Main Street, Mohanur"
                              className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[#2C1A17]/60 uppercase tracking-wider">Landmark</label>
                              <div className="relative">
                                <Landmark className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#2C1A17]/30" />
                                <input
                                  type="text"
                                  value={landmark}
                                  onChange={e => setLandmark(e.target.value)}
                                  placeholder="Near temple..."
                                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-bold text-[#2C1A17]/60 uppercase tracking-wider">City</label>
                              <input
                                type="text"
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                placeholder="Mohanur"
                                className="w-full px-3 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-sm focus:outline-none focus:border-[#C9A227] transition-all"
                              />
                            </div>
                          </div>

                          {/* Save Address checkbox (logged-in only) */}
                          {user && (
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={saveThisAddress}
                                onChange={e => setSaveThisAddress(e.target.checked)}
                                className="w-4 h-4 rounded accent-amber-600"
                              />
                              <span className="text-xs text-[#2C1A17]/60">Save this address for future orders</span>
                            </label>
                          )}
                        </div>
                      )}

                      {/* Delivery Area Validation */}
                      <AnimatePresence>
                        {orderType === 'delivery' && !deliveryValidation.isValid && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
                          >
                            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-red-700">Delivery not available in this area</p>
                              <p className="text-[11px] text-red-600/80 mt-0.5">Home delivery is available only within Mohanur. Please choose Pickup from Shop.</p>
                            </div>
                          </motion.div>
                        )}
                        {orderType === 'delivery' && deliveryValidation.isValid && (streetArea || doorNo) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                            <p className="text-xs font-semibold text-green-700">Delivery available in {city || 'Mohanur'} ✓</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ─── PICKUP INFO (shown only for pickup) ───────────────────────── */}
              <AnimatePresence>
                {orderType === 'pickup' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm"
                  >
                    <div className="px-5 py-4 border-b border-[#2C1A17]/8 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-[#2A0E0A] flex items-center justify-center">
                        <Store className="w-4 h-4 text-[#C9A227]" />
                      </div>
                      <h2 className="font-semibold text-[#2A0E0A] text-sm">Pickup Location</h2>
                    </div>
                    <div className="p-5">
                      <div className="bg-[#FAF7F2] rounded-xl p-4 space-y-2">
                        <p className="font-bold text-[#2A0E0A] text-sm">M.G. Iyengar Bakery & Chats</p>
                        <p className="text-xs text-[#2C1A17]/60">
                          {settings.storeAddress || 'Mohanur Main Road, Mohanur, Namakkal, Tamil Nadu 637015'}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Clock className="w-3.5 h-3.5 text-[#C9A227]" />
                          <p className="text-xs text-[#2C1A17]/60">
                            {settings.businessHours || '9:00 AM – 10:00 PM'}
                          </p>
                        </div>
                        <p className="text-xs text-green-600 font-semibold">✓ No delivery charge for pickup</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>

            {/* ── RIGHT COLUMN: ORDER SUMMARY ──────────────────────────────────────── */}
            <div className="space-y-5">

              {/* Order Items */}
              <div className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#2C1A17]/8 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#2A0E0A] flex items-center justify-center">
                    <ShoppingBag className="w-4 h-4 text-[#C9A227]" />
                  </div>
                  <h2 className="font-semibold text-[#2A0E0A] text-sm">Order Summary</h2>
                </div>
                <div className="divide-y divide-[#2C1A17]/6">
                  {cartItems.map((item, idx) => (
                    <div key={`${item.id}-${item.selectedWeight}-${idx}`} className="px-5 py-3 flex gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                        onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=100&q=80'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#2A0E0A] text-xs truncate">{item.name}</p>
                        {item.selectedWeight && item.selectedWeight !== 'Standard' && (
                          <p className="text-[11px] text-[#2C1A17]/50">{item.selectedWeight}</p>
                        )}
                        {item.customizations && Object.entries(item.customizations).map(([k, v]) =>
                          v ? <p key={k} className="text-[10px] text-[#2C1A17]/40">{k}: {v}</p> : null
                        )}
                        <p className="text-[11px] text-[#2C1A17]/50 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#2A0E0A] text-sm shrink-0">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-white rounded-2xl border border-[#2C1A17]/10 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-[#2C1A17]/8">
                  <h2 className="font-semibold text-[#2A0E0A] text-sm">Price Summary</h2>
                </div>
                <div className="px-5 py-4 space-y-2.5">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2C1A17]/60">Subtotal</span>
                    <span className="font-semibold text-[#2A0E0A]">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Coupon Discount</span>
                      <span className="font-semibold">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-[#2C1A17]/60">Delivery Charge</span>
                    <span className={`font-semibold ${deliveryFee === 0 ? 'text-green-600' : 'text-[#2A0E0A]'}`}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="border-t border-[#2C1A17]/10 pt-2.5 flex justify-between">
                    <span className="font-bold text-[#2A0E0A]">Total</span>
                    <span className="font-bold text-[#2A0E0A] text-lg">₹{grandTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-[#FAF7F2] rounded-2xl border border-[#C9A227]/20 p-4">
                <div className="flex items-center gap-2.5 mb-2">
                  <MessageCircle className="w-5 h-5 text-green-600" />
                  <p className="font-bold text-[#2A0E0A] text-sm">WhatsApp Ordering</p>
                </div>
                <p className="text-xs text-[#2C1A17]/60 leading-relaxed">
                  After placing your order, a pre-filled WhatsApp message will open. Review your order and press Send to confirm with the bakery. Payment is collected at delivery or pickup.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {orderError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-red-700">{orderError}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* PLACE ORDER BUTTON */}
              <motion.button
                type="submit"
                disabled={isPlacingOrder}
                whileHover={{ scale: isPlacingOrder ? 1 : 1.02 }}
                whileTap={{ scale: isPlacingOrder ? 1 : 0.97 }}
                className="w-full bg-[#2A0E0A] hover:bg-[#401C16] disabled:opacity-60 disabled:cursor-not-allowed text-[#C9A227] font-bold py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 text-sm cursor-pointer"
              >
                {isPlacingOrder ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      className="w-5 h-5 rounded-full border-2 border-[#C9A227] border-t-transparent"
                    />
                    Saving your order…
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5" />
                    Place Order & Open WhatsApp
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <p className="text-center text-[11px] text-[#2C1A17]/40">
                Your order will be saved securely before WhatsApp opens
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
