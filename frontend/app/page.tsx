'use client'
import { useState } from 'react'
import AppLayout from "./app-layout"
import dynamic from 'next/dynamic'

// Dynamically import the IntroAnimation with no SSR
const IntroAnimation = dynamic(() => import('@/components/intro-animation'), {
  ssr: false
})

export default function Home() {
  const [showIntro, setShowIntro] = useState(true)

  const handleIntroComplete = () => {
    setShowIntro(false)
  }

  return (
    <>
      {showIntro ? (
        <IntroAnimation onComplete={handleIntroComplete} />
      ) : (
        <AppLayout />
      )}
    </>
  )
}

