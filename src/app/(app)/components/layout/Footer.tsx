import React from 'react'

const Footer = () => {
  return (
    <div>
        <footer className="bg-[#4f46e5] text-white py-4 mt-8">
          <div className="container mx-auto text-center">
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            </div>
        </footer>
    </div>
  )
}

export default Footer