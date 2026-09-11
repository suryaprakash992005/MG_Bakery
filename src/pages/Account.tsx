import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, Mail, MapPin, Plus, Trash2,
  Package, Heart, LogOut, ArrowRight, Home as HomeIcon,
  Briefcase, Sparkles, Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useBakeryDatabase } from '../context/DatabaseContext';

export const Account: React.FC = () => {
  const {
    user,
    profile,
    savedAddresses,
    logout,
    setIsAuthModalOpen,
    setAuthModalTab,
    updateGuestProfile,
    saveAddress,
    removeAddress,
    setDefaultAddress,
  } = useAuth();

  const { wishlistCount } = useWishlist();
  const { orders } = useBakeryDatabase();
  const navigate = useNavigate();

  const userOrders = React.useMemo(() => {
    return orders.filter(ord => {
      if (user?.id && ((ord as any).userId === user.id || (ord as any).user_id === user.id)) return true;
      if (profile?.phone && ord.phone?.includes(profile.phone.replace(/\D/g, ''))) return true;
      return false;
    });
  }, [orders, user, profile]);

  // Profile Edit State
  const [name, setName] = useState(profile?.name || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [isSaved, setIsSaved] = useState(false);

  // New Address Form State
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrLabel, setAddrLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrDoor, setAddrDoor] = useState('');
  const [addrLandmark, setAddrLandmark] = useState('');
  const [addrCity, setAddrCity] = useState('Mohanur');
  const [addrPincode, setAddrPincode] = useState('637015');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateGuestProfile({ name, phone, email });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrStreet.trim()) return;

    saveAddress({
      label: addrLabel,
      name: name || 'Customer',
      phone: phone || '',
      doorNo: addrDoor,
      streetArea: addrStreet,
      landmark: addrLandmark,
      city: addrCity,
      pincode: addrPincode,
      isDefault: savedAddresses.length === 0,
    });

    setShowAddressForm(false);
    setAddrStreet('');
    setAddrDoor('');
    setAddrLandmark('');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] pt-[92px] lg:pt-[96px] pb-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Page Header ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2C1A17]/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#2A0E0A] text-[#C9A227] flex items-center justify-center text-xl font-bold font-playfair shadow-md">
              {profile?.name ? profile.name.charAt(0).toUpperCase() : <User className="w-8 h-8" />}
            </div>
            <div>
              <h1 className="font-playfair text-2xl sm:text-3xl font-bold text-[#2A0E0A]">
                {profile?.name || 'Customer Account'}
              </h1>
              <p className="text-xs text-[#2C1A17]/60 mt-0.5">
                {user ? `Signed in as ${user.email}` : 'Express Profile / Guest Session'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {user ? (
              <button
                onClick={() => logout()}
                className="flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-bold cursor-pointer transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setAuthModalTab('login');
                  setIsAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-[#2A0E0A] text-[#C9A227] hover:bg-[#401C16] rounded-full text-xs font-bold cursor-pointer transition-all shadow-sm"
              >
                <span>Sign In / Create Account</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── Guest Warning / Sync Banner ────────────────────────────────────────── */}
        {!user && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/70 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2A0E0A] text-[#C9A227] flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-[#2A0E0A]">Sync your account with Supabase</h4>
                <p className="text-[11px] text-[#2C1A17]/70 mt-0.5">
                  Sign in or create an account with your mobile number to permanently save addresses and view live order statuses across any device.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setAuthModalTab('signup');
                setIsAuthModalOpen(true);
              }}
              className="px-4 py-2 bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] rounded-xl text-xs font-bold shrink-0 cursor-pointer transition-all shadow-sm"
            >
              Sign In / Register
            </button>
          </div>
        )}

        {/* ── Quick Links Strip ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div
            onClick={() => navigate('/my-orders')}
            className="bg-white p-4 rounded-2xl border border-[#2C1A17]/10 hover:border-[#C9A227] shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#2A0E0A] truncate">My Orders</p>
              <p className="text-[10px] text-[#2C1A17]/50">{userOrders.length} order{userOrders.length !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/wishlist')}
            className="bg-white p-4 rounded-2xl border border-[#2C1A17]/10 hover:border-[#C9A227] shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#2A0E0A] truncate">Wishlist</p>
              <p className="text-[10px] text-[#2C1A17]/50">{wishlistCount} saved item{wishlistCount !== 1 ? 's' : ''}</p>
            </div>
          </div>

          <div
            onClick={() => setShowAddressForm(true)}
            className="bg-white p-4 rounded-2xl border border-[#2C1A17]/10 hover:border-[#C9A227] shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#2A0E0A] truncate">Addresses</p>
              <p className="text-[10px] text-[#2C1A17]/50">{savedAddresses.length} saved</p>
            </div>
          </div>

          <div
            onClick={() => navigate('/menu')}
            className="bg-white p-4 rounded-2xl border border-[#2C1A17]/10 hover:border-[#C9A227] shadow-sm flex items-center gap-3 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 rounded-xl bg-[#2A0E0A] text-[#C9A227] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs text-[#2A0E0A] truncate">Browse Menu</p>
              <p className="text-[10px] text-[#2C1A17]/50">Fresh daily bakes</p>
            </div>
          </div>
        </div>

        {/* ── Main 2-Column Section ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Column: Personal Information Form (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm border border-[#2C1A17]/10 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
              Personal Information
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Your Name"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Phone / WhatsApp Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit phone number"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227] transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-[#2C1A17]/70 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#2C1A17]/40" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F2] border border-[#2C1A17]/15 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#C9A227] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2A0E0A] hover:bg-[#401C16] text-[#C9A227] font-bold py-3 rounded-xl text-xs cursor-pointer transition-all flex items-center justify-center gap-2 mt-2"
              >
                {isSaved ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <span>Update Profile Details</span>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Saved Delivery Addresses (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm border border-[#2C1A17]/10 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-[#2C1A17]/60">
                  Saved Delivery Addresses
                </h2>
                <p className="text-[11px] text-[#2C1A17]/50">Autofill during checkout in Mohanur & nearby areas</p>
              </div>

              <button
                onClick={() => setShowAddressForm(!showAddressForm)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#FAF7F2] hover:bg-[#F3EDE2] border border-[#2C1A17]/15 rounded-xl text-xs font-bold text-[#2A0E0A] cursor-pointer transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-[#C9A227]" />
                <span>Add Address</span>
              </button>
            </div>

            {/* Address Form */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddAddress}
                  className="bg-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#2C1A17]/10 space-y-3"
                >
                  <h3 className="text-xs font-bold text-[#2A0E0A]">New Delivery Address</h3>

                  {/* Label Selector */}
                  <div className="flex gap-2">
                    {(['Home', 'Work', 'Other'] as const).map(lbl => (
                      <button
                        key={lbl}
                        type="button"
                        onClick={() => setAddrLabel(lbl)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                          addrLabel === lbl ? 'bg-[#2A0E0A] text-[#C9A227]' : 'bg-white text-[#2C1A17]/70 border border-[#2C1A17]/10'
                        }`}
                      >
                        {lbl}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Door / Flat No."
                      value={addrDoor}
                      onChange={e => setAddrDoor(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none focus:border-[#C9A227]"
                    />
                    <input
                      type="text"
                      placeholder="Landmark (optional)"
                      value={addrLandmark}
                      onChange={e => setAddrLandmark(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none focus:border-[#C9A227]"
                    />
                  </div>

                  <input
                    type="text"
                    required
                    placeholder="Street / Area / Colony *"
                    value={addrStreet}
                    onChange={e => setAddrStreet(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none focus:border-[#C9A227]"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={addrCity}
                      onChange={e => setAddrCity(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none"
                    />
                    <input
                      type="text"
                      value={addrPincode}
                      onChange={e => setAddrPincode(e.target.value)}
                      className="px-3 py-2 bg-white border border-[#2C1A17]/15 rounded-xl text-xs focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="submit"
                      className="flex-1 bg-[#2A0E0A] text-[#C9A227] py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="px-4 bg-white border border-[#2C1A17]/15 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* Address List */}
            {savedAddresses.length === 0 ? (
              <div className="text-center py-8 text-[#2C1A17]/40 text-xs border border-dashed border-[#2C1A17]/15 rounded-2xl p-6">
                <MapPin className="w-6 h-6 mx-auto mb-2 opacity-50" />
                <p>No saved addresses yet.</p>
                <p className="text-[10px] mt-0.5">Click "Add Address" above to save your home or work address.</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {savedAddresses.map(addr => (
                  <div
                    key={addr.id}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                      addr.isDefault ? 'bg-[#FAF7F2] border-[#C9A227]' : 'bg-white border-[#2C1A17]/10'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2A0E0A] flex items-center gap-1">
                          {addr.label === 'Work' ? <Briefcase className="w-3.5 h-3.5 text-[#C9A227]" /> : <HomeIcon className="w-3.5 h-3.5 text-[#C9A227]" />}
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="bg-[#C9A227] text-[#2A0E0A] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#2C1A17]/75 leading-relaxed break-words">
                        {addr.doorNo ? `${addr.doorNo}, ` : ''}{addr.streetArea}
                        {addr.landmark ? ` (Near ${addr.landmark})` : ''}, {addr.city} - {addr.pincode}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#2C1A17]/5 shrink-0 self-end sm:self-start">
                      {!addr.isDefault && (
                        <button
                          onClick={() => setDefaultAddress(addr.id)}
                          className="text-[11px] font-bold text-[#C9A227] hover:underline cursor-pointer px-2 py-1 rounded-lg hover:bg-[#FAF6F0]"
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => removeAddress(addr.id)}
                        className="w-8 h-8 rounded-lg hover:bg-red-50 text-red-500 flex items-center justify-center cursor-pointer transition-colors"
                        aria-label="Delete address"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
