import './App.css'
import Navbar from './components/Navbar.jsx'
import HomePage from './components/HomePage.jsx'
import Footer from './components/Footer.jsx'

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Navbar />
      <HomePage />
      <Footer />
    </div>
  )
}

export default App
