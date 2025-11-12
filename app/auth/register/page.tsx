"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialRole = (searchParams.get("role") as "victim" | "hospital") || "victim"

  const [role, setRole] = useState<"victim" | "hospital">(initialRole)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    // Victim specific
    hometown: "",
    bloodGroup: "",
    allergies: "",
    emergencyContact: "",
    // Hospital specific
    hospitalName: "",
    address: "",
    services: "",
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    if (role === "victim") {
      localStorage.setItem("victimProfile", JSON.stringify(formData))
      setTimeout(() => {
        router.push("/victim/medical-records-setup")
        setLoading(false)
      }, 1000)
    } else {
      setTimeout(() => {
        router.push("/hospital/dashboard")
        setLoading(false)
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/ers-logo.png" alt="ERS Logo" width={40} height={40} className="rounded-lg" />
            <span className="font-semibold text-xl text-foreground">ERS</span>
          </Link>
        </div>

        <Card className="border-border/50">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join ERS to save lives</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Role Selection */}
              <div className="space-y-3 mb-6">
                <label className="text-sm font-medium text-foreground">I am a</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "victim", label: "Victim" },
                    { value: "hospital", label: "Hospital" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setRole(option.value as "victim" | "hospital")}
                      className={`p-3 rounded-lg border-2 transition-smooth font-medium ${
                        role === option.value
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:border-primary/50"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Fields */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {role === "victim" ? "Full Name" : "Hospital Name"}
                </label>
                <Input
                  type="text"
                  name={role === "victim" ? "name" : "hospitalName"}
                  placeholder={role === "victim" ? "John Doe" : "City Hospital"}
                  value={role === "victim" ? formData.name : formData.hospitalName}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email</label>
                <Input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="+1 (555) 000-0000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              {/* Victim Specific Fields */}
              {role === "victim" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Hometown</label>
                    <Input
                      type="text"
                      name="hometown"
                      placeholder="Your city"
                      value={formData.hometown}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Blood Group</label>
                    <Input
                      type="text"
                      name="bloodGroup"
                      placeholder="O+, A-, etc."
                      value={formData.bloodGroup}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Allergic Medicines</label>
                    <Input
                      type="text"
                      name="allergies"
                      placeholder="Penicillin, Aspirin, etc."
                      value={formData.allergies}
                      onChange={handleChange}
                      className="bg-input border-border"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Emergency Contact</label>
                    <Input
                      type="tel"
                      name="emergencyContact"
                      placeholder="+1 (555) 000-0000"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </>
              )}

              {/* Hospital Specific Fields */}
              {role === "hospital" && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Address</label>
                    <Input
                      type="text"
                      name="address"
                      placeholder="Hospital address"
                      value={formData.address}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Services Provided</label>
                    <Input
                      type="text"
                      name="services"
                      placeholder="Cardiac Care, Trauma Center, 24/7 ER"
                      value={formData.services}
                      onChange={handleChange}
                      className="bg-input border-border"
                      required
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Password</label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Confirm Password</label>
                <Input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="bg-input border-border"
                  required
                />
              </div>

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 transition-smooth mt-6"
              >
                {loading ? "Creating account..." : "Create Account"}
              </Button>

              {/* Sign In Link */}
              <p className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
