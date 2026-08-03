import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Cart', path: '/cart' },
  { label: 'Wishlist', path: '/wishlist' },
  { label: 'Order History', path: '/orders' },
  { label: 'Profile', path: '/profile' },
];

const categories = [
  { label: 'Whisky', path: '/?category=whisky' },
  { label: 'Beer', path: '/?category=beer' },
  { label: 'Wine', path: '/?category=wine' },
  { label: 'Vodka', path: '/?category=vodka' },
  { label: 'Rum', path: '/?category=rum' },
];

const legalLinks = [
  { label: 'Terms of Service', path: '/terms' },
  { label: 'Privacy Policy', path: '/privacy' },
  { label: 'Refund Policy', path: '/refund-policy' },
];

function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="gradient-dark text-white" role="contentinfo">
      {/* Main grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* ── Column 1: Brand ──────────────────────────── */}
          <div className="sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link to="/" className="inline-flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <span className="text-dark-900 font-display font-bold text-lg">
                  S&S
                </span>
              </div>
              <span className="text-white font-display font-bold text-xl tracking-tight">
                Sip & Savor
              </span>
            </Link>

            <p className="text-dark-400 text-sm leading-relaxed mb-5 max-w-xs">
              India's premium alcohol delivery platform. Browse, order, and
              enjoy responsibly — delivered to your doorstep.
            </p>

            {/* 21+ badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
              <ShieldCheck size={16} className="text-accent" />
              <span className="text-xs font-semibold text-dark-300">
                21+ Only — Drink Responsibly
              </span>
            </div>
          </div>

          {/* ── Column 2: Quick Links ────────────────────── */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h4>
            <ul className="space-y-3" role="list">
              {quickLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-dark-400 text-sm hover:text-accent transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 3: Categories ─────────────────────── */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Categories
            </h4>
            <ul className="space-y-3" role="list">
              {categories.map(({ label, path }) => (
                <li key={label}>
                  <Link
                    to={path}
                    className="text-dark-400 text-sm hover:text-accent transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Column 4: Contact & Legal ────────────────── */}
          <div>
            <h4 className="text-white font-display font-semibold text-sm uppercase tracking-wider mb-5">
              Contact & Legal
            </h4>

            {/* Contact info */}
            <ul className="space-y-3 mb-6" role="list">
              <li>
                <a
                  href="mailto:support@sipandsavor.in"
                  className="flex items-center gap-2.5 text-dark-400 text-sm hover:text-accent transition-colors duration-200"
                >
                  <Mail size={15} className="flex-shrink-0" />
                  <span>support@sipandsavor.in</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+911800123456"
                  className="flex items-center gap-2.5 text-dark-400 text-sm hover:text-accent transition-colors duration-200"
                >
                  <Phone size={15} className="flex-shrink-0" />
                  <span>1800-123-456</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-dark-400 text-sm">
                  <MapPin size={15} className="flex-shrink-0 mt-0.5" />
                  <span>
                    123 MG Road, Bangalore,
                    <br />
                    Karnataka 560001
                  </span>
                </div>
              </li>
            </ul>

            {/* Legal links */}
            <ul className="space-y-2.5" role="list">
              {legalLinks.map(({ label, path }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className="text-dark-500 text-xs hover:text-accent transition-colors duration-200"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ────────────────────────────────────── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-dark-500 text-xs">
            <span>© {currentYear} Sip & Savor. All rights reserved.</span>
            <div className="flex gap-4">
              <Link to="/retailer/login" className="hover:text-accent transition-colors">Partner with Us</Link>
              <Link to="/delivery/login" className="hover:text-accent transition-colors">Drive with Us</Link>
              <Link to="/admin/login" className="hover:text-accent transition-colors">Admin Portal</Link>
            </div>
          </div>
          <p className="text-dark-600 text-xs text-center md:text-right">
            🍷 Please drink responsibly. Not for sale to persons under 21.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
