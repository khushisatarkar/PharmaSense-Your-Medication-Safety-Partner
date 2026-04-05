<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />

    <link
      rel="stylesheet"
      href="https://use.fontawesome.com/releases/v5.15.4/css/all.css"
    />
    <title>PharmaSense</title>
    <link rel="stylesheet" href="style.css" />

    <style>
      /* Smooth scroll */
      html { scroll-behavior: smooth; }

      /* Initial hidden state for animations */
      .hidden {
        opacity: 0;
        transform: translateY(40px);
        transition: all 0.8s ease;
      }

      .show {
        opacity: 1;
        transform: translateY(0);
      }

      /* Slide from left */
      .slide-left {
        transform: translateX(-80px);
      }

      .slide-right {
        transform: translateX(80px);
      }

      .show.slide-left,
      .show.slide-right {
        transform: translateX(0);
      }

      /* Hero floating image */
      .hero-img img {
        animation: float 4s ease-in-out infinite;
      }

      @keyframes float {
        0% { transform: translateY(0px); }
        50% { transform: translateY(-15px); }
        100% { transform: translateY(0px); }
      }

      /* Button hover animation */
      button {
        transition: all 0.3s ease;
      }

      button:hover {
        transform: scale(1.05);
      }

      /* Feature card hover */
      .feature-box {
        transition: all 0.3s ease;
      }

      .feature-box:hover {
        transform: translateY(-10px);
        box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      }

      /* Fade-in stagger */
      .feature-box:nth-child(1) { transition-delay: 0.1s; }
      .feature-box:nth-child(2) { transition-delay: 0.2s; }
      .feature-box:nth-child(3) { transition-delay: 0.3s; }
    </style>
  </head>

  <body>
    <header id="header">
      <a href="#index.php"><img src="logo.png" class="logo" alt="" /></a>

      <div>
        <ul id="navbar">
          <a href="signup.html"><button>Get Started</button></a>
        </ul>
      </div>
    </header>

    <section id="hero">
      <div class="hero-text hidden slide-left">
        <h1>
          Your <span>Medication</span><br />
          <span>Safety</span> Partner
        </h1>

        <p>
          Analyze medications, check drug interactions, and discover safe home
          remedies.
        </p>

        <div class="hero-buttons">
          <a href="signup.html"></a>
          <button class="primary-btn">Start Free Analysis</button>
          <button class="secondary-btn">Learn More</button>
        </div>

        <div class="disclaimer">
          <span class="line"></span>
          <p>
            <b>Medical Disclaimer:</b> Informational only. Not medical advice.
          </p>
        </div>
      </div>

      <div class="hero-img hidden slide-right">
        <img src="doctor.jpg" alt="" />
      </div>
    </section>

    <section id="features">
      <div class="features-title hidden">
        <h2>Comprehensive Health Features</h2>
        <p>Everything you need for safe medication management</p>
      </div>

      <div class="features-container">
        <div class="feature-box hidden">
          <div class="icon orange">
            <i class="fas fa-shield-alt"></i>
          </div>
          <h3>Drug Compatibility</h3>
          <p>Check interactions with severity ratings</p>
        </div>

        <div class="feature-box hidden">
          <div class="icon green">
            <i class="fas fa-heartbeat"></i>
          </div>
          <h3>Safety Analysis</h3>
          <p>Personalized assessment</p>
        </div>

        <div class="feature-box hidden" onclick="goToRemedies()">
          <div class="icon orange">
            <i class="fas fa-home"></i>
          </div>
          <h3>Home Remedies</h3>
          <p>Safe natural remedies</p>
        </div>
      </div>
    </section>

    <section id="analysis">
      <div class="analysis-img hidden slide-left">
        <img src="pills.jpg" alt="Medicine" />
      </div>

      <div class="analysis-text hidden slide-right">
        <h2>Intelligent Analysis</h2>

        <p class="analysis-desc">
          AI-powered personalized safety recommendations.
        </p>

        <div class="analysis-point">
          <i class="fas fa-check"></i>
          <div>
            <h4>Comprehensive Profile</h4>
          </div>
        </div>

        <div class="analysis-point">
          <i class="fas fa-check"></i>
          <div>
            <h4>Real-time Analysis</h4>
          </div>
        </div>

        <div class="analysis-point">
          <i class="fas fa-check"></i>
          <div>
            <h4>Safety First</h4>
          </div>
        </div>
      </div>
    </section>

    <?php include "footer.php"; ?>

    <script>
      // Scroll animation
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("show");
          }
        });
      });

      document.querySelectorAll(".hidden").forEach((el) => observer.observe(el));

      function goToRemedies() {
        window.location.href = "remedies.php";
      }
    </script>
  </body>
</html>
