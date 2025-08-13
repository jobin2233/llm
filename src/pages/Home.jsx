import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 py-12">
      {/* Hero Section */}
      <div className="text-center mb-20 relative animate-fade-in-up">
        {/* Glassmorphism Hero Container */}
        <div className="max-w-6xl mx-auto px-4">
          <div className="glass-medium rounded-3xl py-20 px-8 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full -translate-x-36 -translate-y-36 animate-float"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-indigo-200/30 to-transparent rounded-full translate-x-48 translate-y-48 animate-float" style={{animationDelay: '1s'}}></div>

            <div className="relative z-10">
              <h1 className="heading-professional text-5xl md:text-7xl mb-8 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 bg-clip-text text-transparent animate-gradient-shift">
                Smart Skin Analysis Platform
              </h1>
              <p className="text-professional text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto mb-10 leading-relaxed">
                Experience the future of dermatology with our advanced AI-powered skin analysis system.
                Get instant, professional-grade insights and personalized recommendations.
              </p>
              <div className="flex justify-center">
                <button className="btn-glass group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-crystal text-lg font-semibold relative z-10 flex items-center gap-2">
                    ✨ Begin Your Analysis
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 mb-20">
        <div className="text-center mb-16">
          <h2 className="heading-professional text-4xl md:text-5xl mb-6 bg-gradient-to-r from-purple-600 to-indigo-700 bg-clip-text text-transparent">
            Advanced Features
          </h2>
          <p className="text-professional text-lg text-slate-600 max-w-2xl mx-auto">
            Discover the powerful capabilities that make SynthesisAI the most advanced skin analysis platform
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="card-glass group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full translate-x-10 -translate-y-10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="heading-professional text-xl mb-4 text-crystal">Advanced Skin Detection</h3>
              <p className="text-professional text-slate-600 leading-relaxed">
                Upload high-resolution images for precise AI analysis that identifies potential skin conditions with medical-grade accuracy.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="card-glass group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-indigo-200/30 to-transparent rounded-full translate-x-10 -translate-y-10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="heading-professional text-xl mb-4 text-crystal">Intelligent Assistant</h3>
              <p className="text-professional text-slate-600 leading-relaxed">
                Engage with our sophisticated AI dermatology assistant for expert guidance on treatments and skincare routines.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="card-glass group relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/30 to-transparent rounded-full translate-x-10 -translate-y-10"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-6 shadow-elegant group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="heading-professional text-xl mb-4 text-crystal">Personalized Insights</h3>
              <p className="text-professional text-slate-600 leading-relaxed">
                Receive customized skincare recommendations and treatment plans tailored specifically to your unique skin profile.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="glass-strong rounded-3xl py-20 px-8 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-purple-300/20 to-transparent rounded-full -translate-x-20 -translate-y-20 animate-float"></div>
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-gradient-to-tl from-indigo-300/20 to-transparent rounded-full translate-x-24 translate-y-24 animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-gradient-to-r from-pink-300/10 to-transparent rounded-full -translate-x-16 -translate-y-16 animate-float" style={{animationDelay: '1s'}}></div>

          <div className="relative z-10">
            <div className="text-center mb-16">
              <h2 className="heading-professional text-4xl md:text-5xl mb-6 text-crystal">
                How It Works
              </h2>
              <p className="text-professional text-lg text-slate-700 max-w-2xl mx-auto">
                Experience our streamlined process designed for accuracy and ease of use
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8">
              {/* Step 1 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-luxury group-hover:shadow-elegant transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2">
                    <span className="text-crystal-white">1</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-indigo-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="heading-professional text-xl mb-3 text-crystal">Access Platform</h3>
                <p className="text-professional text-slate-600">Launch the intelligent assistant from anywhere on the platform</p>
              </div>

              {/* Step 2 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-luxury group-hover:shadow-elegant transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2">
                    <span className="text-crystal-white">2</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="heading-professional text-xl mb-3 text-crystal">Upload Image</h3>
                <p className="text-professional text-slate-600">Capture or upload high-quality images of your skin concern</p>
              </div>

              {/* Step 3 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-luxury group-hover:shadow-elegant transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2">
                    <span className="text-crystal-white">3</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="heading-professional text-xl mb-3 text-crystal">AI Analysis</h3>
                <p className="text-professional text-slate-600">Advanced algorithms analyze your skin with medical precision</p>
              </div>

              {/* Step 4 */}
              <div className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-luxury group-hover:shadow-elegant transition-all duration-300 transform group-hover:scale-110 group-hover:-translate-y-2">
                    <span className="text-crystal-white">4</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-400/20 to-purple-400/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                <h3 className="heading-professional text-xl mb-3 text-crystal">Get Insights</h3>
                <p className="text-professional text-slate-600">Receive detailed analysis and personalized recommendations</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
