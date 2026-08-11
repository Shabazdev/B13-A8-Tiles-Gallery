/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { Mail, Phone, MapPin, Send, Instagram, Twitter, MessageSquare, Shield } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubscribe = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
      setTimeout(() => setSubmitted(false), 3000);
    }
  };

  return (
    <footer className="bg-neutral-900 text-neutral-400 border-t border-neutral-800">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          
          {/* Column 1: Brand & Purpose */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <span className="font-sans text-xl font-bold tracking-tight">Tesserae</span>
            </div>
            <p className="text-xs leading-relaxed text-neutral-400 font-sans max-w-xs">
              A curated virtual showroom showcasing exquisite ceramic, glass, porcelain, and stone tile designs from the world's finest artisans.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#twitter" className="p-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 hover:text-white transition-all text-neutral-400">
                <Twitter size={15} />
              </a>
              <a href="#instagram" className="p-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 hover:text-white transition-all text-neutral-400">
                <Instagram size={15} />
              </a>
              <a href="#chat" className="p-2 rounded-lg bg-neutral-800/60 hover:bg-neutral-800 hover:text-white transition-all text-neutral-400">
                <MessageSquare size={15} />
              </a>
            </div>
          </div>

          {/* Column 2: Gallery Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-sans mb-4">Aesthetics</h3>
            <ul className="space-y-2 text-xs">
              <li><a href="#/all-tiles" className="hover:text-white transition-colors">Italian Carrara Marble</a></li>
              <li><a href="#/all-tiles" className="hover:text-white transition-colors">Moroccan Zellige Clay</a></li>
              <li><a href="#/all-tiles" className="hover:text-white transition-colors">Crystalline Glass Brick</a></li>
              <li><a href="#/all-tiles" className="hover:text-white transition-colors">Hexagonal Modern Mosaics</a></li>
            </ul>
          </div>

          {/* Column 3: Contact Us Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-sans">Contact Us</h3>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-start gap-2">
                <MapPin size={14} className="text-neutral-500 mt-0.5 flex-shrink-0" />
                <span>451 Atelier Boulevard, Suite 800, New York, NY 10013</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={14} className="text-neutral-500 flex-shrink-0" />
                <span>+1 (212) 555-0192</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={14} className="text-neutral-500 flex-shrink-0" />
                <span>support@tesseraetiles.com</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter/Join Community */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-sans">Join the Club</h3>
            <p className="text-xs leading-relaxed text-neutral-400">
              Get the latest updates on new artisan drops, weekly tile features, and seasonal designs.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                required
                className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-500 focus:ring-1 focus:ring-neutral-500"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-white text-neutral-900 p-2 hover:bg-neutral-100 transition-colors flex-shrink-0"
              >
                <Send size={14} />
              </button>
            </form>
            {submitted && (
              <p className="text-[10px] text-emerald-400 font-medium">Successfully subscribed to newsletter!</p>
            )}
          </div>
        </div>

        {/* Divider & Bottom copyright */}
        <div className="mt-12 border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <p>© {new Date().getFullYear()} Tesserae. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</a>
            <a href="#terms" className="hover:text-neutral-300 transition-colors flex items-center gap-1">
              <Shield size={10} />
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
