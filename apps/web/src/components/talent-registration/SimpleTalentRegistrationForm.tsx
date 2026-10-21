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

/** Common dial codes for talent registration with proper country flags. */
const DIAL_CODES = [
  { iso: 'IN', code: '+91', flag: '🇮🇳', name: 'India' },
  { iso: 'US', code: '+1', flag: '🇺🇸', name: 'USA' },
  { iso: 'GB', code: '+44', flag: '🇬🇧', name: 'UK' },
  { iso: 'AE', code: '+971', flag: '🇦🇪', name: 'UAE' },
  { iso: 'CA', code: '+1', flag: '🇨🇦', name: 'Canada' },
  { iso: 'AU', code: '+61', flag: '🇦🇺', name: 'Australia' },
  { iso: 'SG', code: '+65', flag: '🇸🇬', name: 'Singapore' },
  { iso: 'DE', code: '+49', flag: '🇩🇪', name: 'Germany' },
  { iso: 'FR', code: '+33', flag: '🇫🇷', name: 'France' },
  { iso: 'NP', code: '+977', flag: '🇳🇵', name: 'Nepal' },
  { iso: 'BD', code: '+880', flag: '🇧🇩', name: 'Bangladesh' },
  { iso: 'LK', code: '+94', flag: '🇱🇰', name: 'Sri Lanka' },
  { iso: 'PK', code: '+92', flag: '🇵🇰', name: 'Pakistan' },
  { iso: 'OTHER', code: '+', flag: '🌍', name: 'Other' },
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
        className={`bg-surface border text-foreground font-medium w-full py-3.5 px-4 cursor-pointer flex justify-between items-center transition-all ${
          error ? 'border-destructive' : isOpen ? 'border-brand shadow-sm bg-background' : 'border-border hover:border-foreground/30'
        } rounded-xl shadow-2xs`}
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

function CountryFlag({ iso }: { iso: string }) {
  if (iso === 'OTHER') {
    return <span className="text-base leading-none">🌍</span>;
  }
  return (
    <img
      src={`https://flagcdn.com/w40/${iso.toLowerCase()}.png`}
      width={20}
      height={14}
      alt={iso}
      className="rounded-[2px] object-cover inline-block shrink-0 shadow-xs border border-border/40"
      loading="eager"
    />
  );
}

function DialCodePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
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

  const selectedItem = DIAL_CODES.find((d) => d.code === value) || DIAL_CODES[0];

  return (
    <div className="relative shrink-0" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-full bg-surface border border-border hover:border-brand rounded-xl text-foreground font-semibold px-3 py-3 flex items-center justify-between gap-2 cursor-pointer transition-colors shrink-0 shadow-2xs whitespace-nowrap min-h-[46px]"
      >
        <CountryFlag iso={selectedItem.iso} />
        <span className="text-xs font-mono font-bold">{selectedItem.code}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform shrink-0 ${isOpen ? 'rotate-180 text-brand' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 mt-1.5 w-56 max-h-56 overflow-y-auto bg-popover border border-border rounded-xl shadow-2xl py-1 text-xs"
          >
            {DIAL_CODES.map((d) => (
              <button
                key={`${d.iso}-${d.code}`}
                type="button"
                onClick={() => {
                  onChange(d.code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-muted transition-colors ${
                  value === d.code ? 'bg-brand/10 text-brand font-bold' : 'text-foreground'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CountryFlag iso={d.iso} />
                  <span className="font-medium">{d.name}</span>
                </div>
                <span className="font-mono text-muted-foreground font-bold">{d.code}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SimpleTalentRegistrationForm() {
  const router = useRouter();
  const supabase = createClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    famousName: '',
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

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Name is required';
    if (!formData.mobile || formData.mobile.length < 6) newErrors.mobile = 'Enter a valid contact number';
    if (!formData.email.includes('@')) newErrors.email = 'Enter a valid email address';
    if (formData.password.length < 6) newErrors.password = 'Min. 6 characters required';
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
      const nameParts = formData.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || 'Talent';
      const lastName = nameParts.slice(1).join(' ') || (formData.famousName.trim() || '');
      const stageName = formData.famousName.trim() || formData.fullName.trim();

      let registered = false;
      let createdUserId: string | null = null;

      try {
        // 1. Try Server-Side Admin Auth API first (bypasses SMTP email verification)
        const registerRes = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.fullName.trim(),
            stageName: stageName,
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
          const registerData = await registerRes.json().catch(() => ({}));
          if (registerData?.user?.id) {
            createdUserId = registerData.user.id;
          }
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

      // 2. Auto-login the talent via internal login API (with reverse-proxy fallback)
      let loginRes = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (loginRes.status === 404) {
        loginRes = await fetch('/api/v1/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        });
      }

      const loginData = await loginRes.json().catch(() => ({}));
      const autoToken = loginData?.token || loginData?.accessToken || loginData?.data?.accessToken;
      const userObj = loginData?.user || loginData?.data?.user;

      if (autoToken) {
        localStorage.setItem('token', autoToken);
        localStorage.setItem('mdms_auth_token', autoToken);
        document.cookie = `token=${autoToken}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `mdms_auth_token=${autoToken}; path=/; max-age=604800; SameSite=Lax`;
        document.cookie = `next-auth.session-token=${autoToken}; path=/; max-age=604800; SameSite=Lax`;
      }
      if (userObj?.id) {
        createdUserId = userObj.id;
      }

      // Create the backend TalentProfile (PENDING_REVIEW) so the applicant
      // appears in the admin moderation queue and — once approved — the public
      // directory. The profile can be enriched later in the talent dashboard.
      const applicantPayload = {
        userId: createdUserId,
        stageName: stageName,
        fullName: formData.fullName.trim(),
        email: formData.email,
        phone: `${formData.dialCode} ${formData.mobile}`.trim(),
        country: formData.country,
        state: formData.state,
        city: formData.city,
        pincode: formData.pincode,
        bio: formData.bio || `Passionate ${formData.category} from ${formData.city}.`,
        experienceLevel: formData.experience,
        category: formData.category,
      };

      try {
        const res = await fetch('/api/talent/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(applicantPayload),
        });
        if (!res.ok) {
          await fetchAPI('/talent/submit', {
            method: 'POST',
            body: JSON.stringify(applicantPayload),
          });
        }
      } catch (profileErr) {
        // Non-blocking: the profile can still be completed from the dashboard.
        console.error('Talent profile creation deferred:', profileErr);
      }

      toast.success('🎉 Registration Successful! Opening your Profile Editor to add photos, videos & details...');
      
      setTimeout(() => {
        router.push('/talent-dashboard/edit');
        router.refresh();
      }, 1200);
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
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-border text-xs font-extrabold tracking-widest uppercase text-brand">
                <User className="w-4 h-4" /> 01. Personal Identification
              </div>

              {/* Row 1: Name & Famous Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Name <span className="text-brand">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aditya Sharma"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3 px-3.5 text-sm transition-colors"
                  />
                  {errors.fullName && <p className="text-destructive text-xs mt-1 font-medium">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
                    <span>Famous Name</span>
                    <span className="text-muted-foreground text-[10px] font-normal normal-case">(Stage Name / Alias)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Adi / Rockstar"
                    value={formData.famousName}
                    onChange={(e) => setFormData({ ...formData, famousName: e.target.value })}
                    className="input-premium bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3 px-3.5 text-sm transition-colors"
                  />
                </div>
              </div>

              {/* Row 2: Mobile Number & Email Address (2 columns) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Mobile Number <span className="text-brand">*</span>
                  </label>
                  <div className="flex gap-2">
                    <DialCodePicker
                      value={formData.dialCode}
                      onChange={(code) => setFormData({ ...formData, dialCode: code })}
                    />
                    <div className="relative flex-1 min-w-0">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/[^0-9]/g, '') })}
                        style={{ paddingLeft: '2.6rem' }}
                        className="input-premium has-icon-left bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3 pr-3 text-sm transition-colors"
                      />
                    </div>
                  </div>
                  {errors.mobile && <p className="text-destructive text-xs mt-1 font-medium">{errors.mobile}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5">
                    Email Address <span className="text-brand">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="email"
                      placeholder="talent@mpproductions.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ paddingLeft: '2.6rem' }}
                      className="input-premium has-icon-left bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3 pr-3 text-sm transition-colors"
                    />
                  </div>
                  {errors.email && <p className="text-destructive text-xs mt-1 font-medium">{errors.email}</p>}
                </div>
              </div>

              {/* Row 3: Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-foreground uppercase tracking-wider mb-1.5 flex justify-between items-center">
                    <span>Password <span className="text-brand">*</span></span>
                    <span className="text-muted-foreground text-[10px] font-normal normal-case">For talent portal login</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="password"
                      autoComplete="new-password"
                      placeholder="Min. 6 chars"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingLeft: '2.6rem' }}
                      className="input-premium has-icon-left bg-surface border border-border focus:border-brand rounded-xl text-foreground font-medium placeholder:text-muted-foreground/60 focus:bg-background w-full py-3 pr-3 text-sm transition-colors"
                    />
                  </div>
                  {errors.password && <p className="text-destructive text-xs mt-1 font-medium">{errors.password}</p>}
                </div>
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
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

       

      </main>
    </div>
  );
}
