"use client";

import React from "react";
import Link from "next/link";
import { Scissors, Sparkles, Award, Heart, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export default function AboutPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#fdfafb", color: "#1c1917", fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #f2e8ed",
          padding: "16px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/showcase" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #be185d 0%, #db2777 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              boxShadow: "0 4px 14px rgba(190, 24, 93, 0.35)",
            }}
          >
            <Scissors size={22} />
          </div>
          <div>
            <div style={{ fontSize: "20px", fontWeight: "800", color: "#831843", letterSpacing: "-0.02em" }}>
              JO DESIGNERS
            </div>
            <div style={{ fontSize: "11px", fontWeight: "600", color: "#9d174d", letterSpacing: "0.08em", textTransform: "uppercase" }}>
              Haute Couture & Tailoring Atelier
            </div>
          </div>
        </Link>

        <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <Link href="/showcase" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Showcase
          </Link>
          <Link href="/about" style={{ color: "#be185d", textDecoration: "none", fontSize: "14px", fontWeight: "700" }}>
            About Us
          </Link>
          <Link href="/contact" style={{ color: "#78716c", textDecoration: "none", fontSize: "14px", fontWeight: "600" }}>
            Contact
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 18px",
              borderRadius: "20px",
              backgroundColor: "#171118",
              color: "#fdf2f8",
              fontSize: "13px",
              fontWeight: "600",
              textDecoration: "none",
            }}
          >
            <ShieldCheck size={16} color="#f472b6" /> Studio Portal
          </Link>
        </nav>
      </header>

      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#fce7f3",
              color: "#9d174d",
              fontSize: "12px",
              fontWeight: "700",
              padding: "6px 14px",
              borderRadius: "20px",
              marginBottom: "16px",
            }}
          >
            <Sparkles size={14} /> Our Heritage & Craft
          </span>
          <h1 style={{ fontSize: "36px", fontWeight: "800", color: "#1c1917", marginBottom: "16px" }}>
            About JO Designers Atelier
          </h1>
          <p style={{ fontSize: "16px", color: "#78716c", maxWidth: "700px", margin: "0 auto", lineHeight: "1.6" }}>
            Crafting timeless bespoke silhouettes with fine tailoring, intricate hand embroidery, and contemporary design precision.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", marginBottom: "50px" }}>
          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #f2e8ed", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <Award size={32} color="#be185d" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917", marginBottom: "8px" }}>Bespoke Master Tailoring</h3>
            <p style={{ fontSize: "14px", color: "#78716c", lineHeight: "1.6" }}>
              Every stitch is measured and customized to your exact contours for unparalleled comfort, elegance, and drape.
            </p>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #f2e8ed", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <Heart size={32} color="#be185d" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917", marginBottom: "8px" }}>Artisanal Embellishment</h3>
            <p style={{ fontSize: "14px", color: "#78716c", lineHeight: "1.6" }}>
              Specializing in authentic bridal aari, zardosi, thread embroidery, and fine hand-beaded finishes on premium silks.
            </p>
          </div>

          <div style={{ backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", border: "1px solid #f2e8ed", boxShadow: "0 4px 12px rgba(0,0,0,0.03)" }}>
            <CheckCircle2 size={32} color="#be185d" style={{ marginBottom: "14px" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#1c1917", marginBottom: "8px" }}>Timely Perfection</h3>
            <p style={{ fontSize: "14px", color: "#78716c", lineHeight: "1.6" }}>
              Reliable delivery commitments with trial fitting sessions to guarantee zero defects for your special occasions.
            </p>
          </div>
        </div>

        <div style={{ backgroundColor: "#ffffff", padding: "36px", borderRadius: "16px", border: "1px solid #f2e8ed", textAlign: "center" }}>
          <h2 style={{ fontSize: "22px", fontWeight: "700", color: "#1c1917", marginBottom: "12px" }}>
            Ready to design your signature outfit?
          </h2>
          <p style={{ fontSize: "14px", color: "#78716c", marginBottom: "24px" }}>
            Explore our curated showcase or get in touch with our designers for an appointment.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "16px" }}>
            <Link
              href="/showcase"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                backgroundColor: "#be185d",
                color: "#ffffff",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Explore Showcase <ArrowRight size={16} />
            </Link>
            <Link
              href="/contact"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 24px",
                borderRadius: "10px",
                border: "1px solid #e7e5e4",
                backgroundColor: "#ffffff",
                color: "#1c1917",
                fontWeight: "600",
                textDecoration: "none",
              }}
            >
              Contact Atelier
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ backgroundColor: "#171118", color: "#fdf2f8", padding: "40px 32px 30px", borderTop: "1px solid #2d1e34", textAlign: "center" }}>
        <div style={{ fontSize: "16px", fontWeight: "700", marginBottom: "8px" }}>JO DESIGNERS BOUTIQUE & ATELIER</div>
        <p style={{ fontSize: "13px", color: "#a8a29e", maxWidth: "600px", margin: "0 auto 16px" }}>
          Premium customized stitching, wedding lehengas, bridal blouses, and couture kids wear.
        </p>
        <div style={{ fontSize: "12px", color: "#78716c" }}>
          © 2026 JO Designers. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
