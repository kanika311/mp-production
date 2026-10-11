'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ArrowRight, Sparkles, CheckCircle2, Globe, Award, Briefcase, User, Mail, Phone, Lock, MapPin, Film, ChevronDown, Search, Check } from 'lucide-react';
import Link from 'next/link';
import { Navbar } from '@/components/ui/Navbar';
import { createClient } from '@/utils/supabase/client';
import { fetchAPI } from '@/lib/api-client';

const TALENT_CATEGORIES = [
  { id: 'actor', label: 'Lead & Supporting Actor / Actress' },
  { id: 'model', label: 'Fashion & Commercial Model' },
  { id: 'musician', label: 'Vocalist / Musician / Composer' },
  { id: 'dancer', label: 'Professional Dancer / Choreographer' },
  { id: 'voice', label: 'Voice Over Artist / Dubbing' },
  { id: 'creator', label: 'Digital Content Creator / Influencer' },
  { id: 'director', label: 'Cinematographer / Director / Writer' },
  { id: 'other', label: 'Versatile / Multi-Disciplinary Talent' },
];

const EXPERIENCE_LEVELS = [
  { id: 'fresher', label: 'Fresher / Emerging (0 - 1 Years)' },
  { id: 'junior', label: 'Intermediate (1 - 3 Years)' },
  { id: 'mid', label: 'Experienced Professional (3 - 5 Years)' },
  { id: 'senior', label: 'Seasoned Veteran (5+ Years)' },
];

/** Common dial codes for talent registration (no heavy geo package). */
const DIAL_CODES = [
  { iso: 'IN', code: '+91', label: '🇮🇳 India +91' },
  { iso: 'US', code: '+1', label: '🇺🇸 USA +1' },
  { iso: 'GB', code: '+44', label: '🇬🇧 UK +44' },
  { iso: 'AE', code: '+971', label: '🇦🇪 UAE +971' },
  { iso: 'SG', code: '+65', label: '🇸🇬 Singapore +65' },
  { iso: 'AU', code: '+61', label: '🇦🇺 Australia +61' },
  { iso: 'CA', code: '+1', label: '🇨🇦 Canada +1' },
  { iso: 'DE', code: '+49', label: '🇩🇪 Germany +49' },
  { iso: 'FR', code: '+33', label: '🇫🇷 France +33' },
  { iso: 'NP', code: '+977', label: '🇳🇵 Nepal +977' },
  { iso: 'BD', code: '+880', label: '🇧🇩 Bangladesh +880' },
  { iso: 'LK', code: '+94', label: '🇱🇰 Sri Lanka +94' },
  { iso: 'PK', code: '+92', label: '🇵🇰 Pakistan +92' },
  { iso: 'OTHER', code: '+', label: '🌍 Other +' },
];

const COUNTRY_OPTIONS = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Singapore',
  'Australia',
  'Canada',
  'Germany',
  'France',
  'Nepal',
  'Bangladesh',
  'Sri Lanka',
  'Pakistan',
  'Other / International',
];

const INDIAN_STATES_AND_CITIES: Record<string, string[]> = {
  'Andaman and Nicobar Islands': ['Port Blair', 'Diglipur', 'Mayabunder', 'Car Nicobar', 'Other'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry', 'Tirupati', 'Kakinada', 'Anantapur', 'Eluru', 'Kadapa', 'Srikakulam', 'Vizianagaram', 'Other'],
  'Arunachal Pradesh': ['Itanagar', 'Tawang', 'Pasighat', 'Ziro', 'Bomdila', 'Roing', 'Aalo', 'Naharlagun', 'Other'],
  'Assam': ['Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur', 'Bongaigaon', 'Karimganj', 'Diphu', 'Other'],
  'Bihar': ['Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Saharsa', 'Other'],
  'Chandigarh': ['Chandigarh', 'Other'],
  'Chhattisgarh': ['Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur', 'Ambikapur', 'Other'],
  'Dadra and Nagar Haveli and Daman and Diu': ['Daman', 'Diu', 'Silvassa', 'Other'],
  'Delhi NCR': ['New Delhi', 'Central Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Gurugram (Gurgaon)', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad', 'Other'],
  'Goa': ['Panaji', 'Vasco da Gama', 'Margao', 'Mapusa', 'Ponda', 'Calangute', 'Candolim', 'Other'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar', 'Junagadh', 'Anand', 'Navsari', 'Morbi', 'Bhuj', 'Bharuch', 'Vapi', 'Other'],
  'Haryana': ['Faridabad', 'Gurugram', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak', 'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh', 'Other'],
  'Himachal Pradesh': ['Shimla', 'Manali', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Kullu', 'Chamba', 'Hamirpur', 'Una', 'Other'],
  'Jammu and Kashmir': ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Sopore', 'Udhampur', 'Poonch', 'Other'],
  'Jharkhand': ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro', 'Hazaribagh', 'Giridih', 'Ramgarh', 'Other'],
  'Karnataka': ['Bengaluru (Bangalore)', 'Mysuru (Mysore)', 'Hubballi-Dharwad', 'Mangaluru (Mangalore)', 'Belagavi (Belgaum)', 'Kalaburagi (Gulbarga)', 'Davanagere', 'Ballari', 'Vijayapura', 'Shivamogga (Shimoga)', 'Tumakuru', 'Udupi', 'Other'],
  'Kerala': ['Thiruvananthapuram', 'Kochi (Cochin)', 'Kozhikode (Calicut)', 'Thrissur', 'Kollam', 'Palakkad', 'Alappuzha', 'Malappuram', 'Kannur', 'Kottayam', 'Kasargod', 'Other'],
  'Ladakh': ['Leh', 'Kargil', 'Other'],
  'Lakshadweep': ['Kavaratti', 'Agatti', 'Minicoy', 'Andrott', 'Other'],
  'Madhya Pradesh': ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa', 'Other'],
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar', 'Aurangabad (Chhatrapati Sambhajinagar)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar', 'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Ulhasnagar', 'Sangli', 'Malegaon', 'Jalgaon', 'Akola', 'Latur', 'Ahilyanagar (Ahmednagar)', 'Dhule', 'Ichalkaranji', 'Chandrapur', 'Parbhani', 'Jalna', 'Satara', 'Ratnagiri', 'Other'],
  'Manipur': ['Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Other'],
  'Meghalaya': ['Shillong', 'Tura', 'Nongstoin', 'Jowai', 'Baghmara', 'Other'],
  'Mizoram': ['Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Serchhip', 'Other'],
  'Nagaland': ['Dimapur', 'Kohima', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Other'],
  'Odisha': ['Bhubaneswar', 'Cuttack', 'Raurkela', 'Brahmapur', 'Sambalpur', 'Puri', 'Baleshwar', 'Bhadrak', 'Baripada', 'Balangir', 'Other'],
  'Puducherry': ['Puducherry (Pondicherry)', 'Karaikal', 'Mahe', 'Yanam', 'Other'],
  'Punjab': ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'SAS Nagar (Mohali)', 'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla', 'Khanna', 'Other'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar', 'Chittorgarh', 'Other'],
  'Sikkim': ['Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Other'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Tiruppur', 'Salem', 'Erode', 'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet', 'Virudhunagar', 'Karur', 'Udhagamandalam (Ooty)', 'Other'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam', 'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Other'],
  'Tripura': ['Agartala', 'Udaipur', 'Dharmanagar', 'Pratapgarh', 'Kailasahar', 'Belonia', 'Other'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Prayagraj (Allahabad)', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar', 'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Ayodhya', 'Other'],
  'Uttarakhand': ['Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh', 'Nainital', 'Almora', 'Other'],
  'West Bengal': ['Kolkata', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'English Bazar (Malda)', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Jalpaiguri', 'Darjeeling', 'Other'],
  'Other / International': ['Other City / International Location']
};

function SearchableDropdown({
  label,
  value,
  onChange,
  options,
  placeholder,
  required = false,
  error,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder: string;
  required?: boolean;
  error?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
        {label} {required && <span className="text-brand">*</span>}
      </label>
      <div
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) setSearch('');
        }}
        className={`input-premium bg-surface border text-foreground font-medium w-full py-3.5 px-4 cursor-pointer flex justify-between items-center transition-all ${
          error ? 'border-destructive' : isOpen ? 'border-brand shadow-sm bg-background' : 'border-border hover:border-foreground/30'
        } rounded-xl`}
      >
        <span className={value ? 'text-foreground font-medium truncate pr-2' : 'text-muted-foreground truncate pr-2'}>
          {value || placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 mt-2 bg-popover border border-border text-popover-foreground rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="p-2.5 border-b border-border bg-surface relative flex items-center">
              <Search className="w-4 h-4 text-brand absolute left-4.5" />
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                className="w-full bg-background border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto divide-y divide-border/40 py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center justify-between ${
                      value === opt
                        ? 'bg-brand/15 text-brand font-bold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <span className="truncate pr-2">{opt}</span>
                    {value === opt && <Check className="w-3.5 h-3.5 text-brand shrink-0" />}
                  </button>
                ))
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (search.trim()) {
                      onChange(search.trim());
                      setIsOpen(false);
                    }
                  }}
                  className="w-full text-left px-4 py-3 text-xs text-brand hover:bg-muted flex items-center gap-2 font-semibold"
                >
                  <Search className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">Use custom: "{search}"</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-destructive text-xs mt-1.5 font-medium">{error}</p>}
    </div>
  );
}

export function SimpleTalentRegistrationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dialCode: '+91',
    mobile: '',
    email: '',
    password: '',
    category: 'actor',
    experience: 'fresher',
    country: 'India',
    state: '',
    city: '',
    pincode: '',
    bio: '',
    acceptTerms: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // India-first location cascading (built-in dataset — no country-state-city package).
  const countryOptions = COUNTRY_OPTIONS;
  const stateOptions = useMemo(() => {
    if (formData.country === 'India') {
      return Object.keys(INDIAN_STATES_AND_CITIES);
    }
    return ['Other'];
  }, [formData.country]);

  const cityOptions = useMemo(() => {
    if (formData.country === 'India' && formData.state) {
      return INDIAN_STATES_AND_CITIES[formData.state] || ['Other'];
    }
    return ['Other City / International Location', 'Other'];
  }, [formData.country, formData.state]);

  const dialCodes = DIAL_CODES;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.mobile || formData.mobile.length < 6) newErrors.mobile = 'Enter a valid contact number';
    if (!formData.email.includes('@')) newErrors.email = 'Enter a valid email address';
    if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.state.trim()) newErrors.state = 'State / Province is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.pincode.trim()) newErrors.pincode = 'Postal / Zip code is required';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms to proceed';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please fill in all required fields precisely.');
      return;
    }

    setIsSubmitting(true);
    try {
      let registered = false;
      try {
        // 1. Try Server-Side Admin Auth API first (bypasses SMTP email verification)
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
            password: formData.password,
            role: 'talent',
            phone: `${formData.dialCode} ${formData.mobile}`.trim(),
            category: formData.category,
            experienceLevel: formData.experience,
            country: formData.country,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
            bio: formData.bio || `Passionate ${formData.category} from ${formData.city}, ${formData.country}.`,
          }),
        });

        if (registerRes.ok) {
          registered = true;
        } else if (registerRes.status !== 404) {
          const registerData = await registerRes.json().catch(() => ({}));
          throw new Error(registerData.message || 'Registration failed');
        }
      } catch (bffErr: any) {
        if (!bffErr.message?.includes('Registration failed')) {
          console.warn('Server-side registration route unreachable, using direct Supabase Auth:', bffErr);
        } else {
          throw bffErr;
        }
      }

      // 2. If reverse proxy blocked /api/auth/register (404), fallback directly to Supabase client sign up
      if (!registered) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: `${formData.firstName} ${formData.lastName}`.trim(),
              role: 'talent',
              phone: `${formData.dialCode} ${formData.mobile}`.trim(),
              category: formData.category,
              experience_level: formData.experience,
              country: formData.country,
              city: formData.city,
              state: formData.state,
              pincode: formData.pincode,
              bio: formData.bio || `Passionate ${formData.category} from ${formData.city}, ${formData.country}.`,
            },
          },
        });
        if (signUpError) {
          throw new Error(signUpError.message || 'Registration failed');
        }
      }

      // Auto-login the talent after successful registration
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });
      if (loginError) throw loginError;

      // Create the backend TalentProfile (PENDING_REVIEW) so the applicant
      // appears in the admin moderation queue and — once approved — the public
      // directory. The profile can be enriched later in the talent dashboard.
      try {
        await fetchAPI('/talent/submit', {
          method: 'POST',
          body: JSON.stringify({
            stageName: `${formData.firstName} ${formData.lastName}`.trim(),
            bio: formData.bio || `Passionate ${formData.category} from ${formData.city}.`,
            experienceLevel: formData.experience,
          }),
        });
      } catch (profileErr) {
        // Non-blocking: the profile can still be completed from the dashboard.
        console.error('Talent profile creation deferred:', profileErr);
      }

      toast.success('🎉 Registration Successful! Redirecting to your Talent Dashboard where you can upload photos & details...');
      
      setTimeout(() => {
        router.push('/talent-dashboard');
        router.refresh();
      }, 1500);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to submit. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-x-hidden grain selection:bg-brand selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Background Multi-Color Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-r from-brand/20 via-brand-gold/10 to-brand-cyan/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-3/4 right-10 w-[500px] h-[500px] bg-brand/10 blur-[160px] pointer-events-none rounded-full" />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 md:pt-36 pb-12 md:pb-16 relative z-10">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 md:mb-14 space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-gold/10 border border-brand-gold/30 text-brand-gold text-xs font-bold tracking-widest uppercase shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Streamlined Quick Onboarding
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight flex flex-col items-center gap-4">
            <img src="/logo.png" alt="MP Productions" className="h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_0_25px_rgba(235,61,38,0.25)]" />
            <span>Join the <span className="text-gradient-brand">Roster</span></span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed font-medium">
            Register below with your essential contact details. Once registered, you will unlock immediate access to your <span className="text-foreground font-bold">Personal Talent Dashboard</span> where you can upload photos, showreels, social links, and multiple talents at your own pace.
          </p>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className="bg-card text-card-foreground backdrop-blur-2xl shadow-xl dark:shadow-[0_20px_70px_rgba(0,0,0,0.8)] rounded-3xl p-6 sm:p-10 md:p-12 relative overflow-hidden border border-border transition-colors duration-300"
        >
          {/* Subtle Top Gradient Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-brand" />

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Section 1: Basic Identity */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-extrabold tracking-widest uppercase text-brand">
                <User className="w-4 h-4" /> 01. Personal Identification
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    First Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aditya"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 px-4 transition-colors"
                  />
                  {errors.firstName && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Last Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sharma"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 px-4 transition-colors"
                  />
                  {errors.lastName && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.lastName}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Mobile Number <span className="text-brand">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={formData.dialCode}
                      onChange={(e) => setFormData({ ...formData, dialCode: e.target.value })}
                      aria-label="Country dial code"
                      className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium w-28 shrink-0 py-3.5 px-2 cursor-pointer transition-colors"
                    >
                      {dialCodes.map((d) => (
                        <option key={d.iso} value={d.code} className="bg-card text-card-foreground">
                          {d.label}
                        </option>
                      ))}
                    </select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                        className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 pl-11 pr-4 transition-colors"
                      />
                    </div>
                  </div>
                  {errors.mobile && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Email Address <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="talent@mpproductions.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 pl-11 pr-4 transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2">
                  Create Account Password <span className="text-brand">*</span>
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Min. 6 characters for login"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 pl-11 pr-4 transition-colors"
                  />
                </div>
                {errors.password && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.password}</p>}
              </div>
            </div>

            {/* Section 2: Professional Profile */}
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-extrabold tracking-widest uppercase text-brand-gold">
                <Film className="w-4 h-4" /> 02. Professional Specialization
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Primary Talent Category <span className="text-brand">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand-gold rounded-xl text-foreground font-medium w-full py-3.5 px-4 cursor-pointer transition-colors"
                  >
                    {TALENT_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-card text-card-foreground py-2">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Experience Level <span className="text-brand">*</span>
                  </label>
                  <select
                    value={formData.experience}
                    onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand-gold rounded-xl text-foreground font-medium w-full py-3.5 px-4 cursor-pointer transition-colors"
                  >
                    {EXPERIENCE_LEVELS.map((level) => (
                      <option key={level.id} value={level.id} className="bg-card text-card-foreground py-2">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SearchableDropdown
                  label="Country"
                  value={formData.country}
                  options={countryOptions}
                  placeholder="Select Country"
                  required={true}
                  error={errors.country}
                  onChange={(newCountry) =>
                    setFormData({ ...formData, country: newCountry, state: '', city: '' })
                  }
                />

                <SearchableDropdown
                  label="State / Province"
                  value={formData.state}
                  options={stateOptions}
                  placeholder="Select State"
                  required={true}
                  error={errors.state}
                  onChange={(newState) =>
                    setFormData({ ...formData, state: newState, city: '' })
                  }
                />

                <SearchableDropdown
                  label="Current City / Hub"
                  value={formData.city}
                  options={cityOptions}
                  placeholder="Select City"
                  required={true}
                  error={errors.city}
                  onChange={(newCity) => setFormData({ ...formData, city: newCity })}
                />

                <div>
                  <label className="block text-sm font-bold text-foreground uppercase tracking-wider mb-2">
                    Postal / Zip Code <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={12}
                    placeholder="e.g. 400001 / SW1A 1AA"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/[^a-zA-Z0-9 -]/g, '') })}
                    className="input-premium bg-surface border border-border focus:border-brand-gold rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3.5 px-4 tracking-wider transition-colors"
                  />
                  {errors.pincode && <p className="text-destructive text-xs mt-1.5 font-medium">{errors.pincode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-2 flex justify-between items-center">
                  <span>About You / Quick Summary</span>
                  <span className="text-muted-foreground text-[11px] font-normal">Can be edited anytime later</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell our casting directors a bit about your passions, past projects, or training..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full p-4 resize-y transition-colors"
                />
              </div>
            </div>

            {/* Terms & Submit Section */}
            <div className="pt-6 border-t border-border space-y-6">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-border bg-surface text-brand focus:ring-brand cursor-pointer"
                />
                <span className="text-sm sm:text-base text-muted-foreground group-hover:text-foreground transition-colors font-medium">
                  I agree to the <Link href="/terms" className="text-brand underline hover:text-brand-glow font-bold">Terms of Service</Link> & <Link href="/privacy" className="text-brand underline hover:text-brand-glow font-bold">Privacy Policy</Link> of MP Productions and confirm all provided details are accurate.
                </span>
              </label>
              {errors.acceptTerms && <p className="text-destructive text-sm mt-1.5 font-bold">{errors.acceptTerms}</p>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4.5 px-6 rounded-2xl bg-gradient-brand hover:opacity-95 text-white font-extrabold text-base sm:text-lg tracking-wider uppercase shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Your Portfolio...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Registration & Go To Dashboard</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Already have an active talent account?{' '}
                  <Link href="/login" className="text-foreground font-bold hover:text-brand transition-colors underline">
                    Sign In Here
                  </Link>
                </p>
              </div>
            </div>

          </form>
        </motion.div>

        {/* Post-Registration Feature Preview */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-md hover:border-brand/40 transition-all duration-300">
            <Award className="w-10 h-10 text-brand-gold mx-auto mb-4" />
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">Instant Portfolio Hub</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">Add unlimited showreels, high-res photos & vocal clips inside your dashboard.</p>
          </div>
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-md hover:border-brand/40 transition-all duration-300">
            <Globe className="w-10 h-10 text-brand-cyan mx-auto mb-4" />
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">Casting Discovery</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">Get discovered directly by verified directors, producers, and premium brands.</p>
          </div>
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border shadow-md hover:border-brand/40 transition-all duration-300">
            <Briefcase className="w-10 h-10 text-brand mx-auto mb-4" />
            <h4 className="text-base sm:text-lg font-bold text-foreground mb-2">Add-On Anytime</h4>
            <p className="text-sm text-muted-foreground leading-relaxed font-medium">No pressure during registration. Expand languages, skills & rates whenever ready.</p>
          </div>
        </div>

      </main>
    </div>
  );
}
