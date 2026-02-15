import { type RouteConfig, route, index, layout } from '@react-router/dev/routes'

export default [
  layout('./components/layout/Layout.tsx', [
    // Public pages
    index('./pages/HomePage.tsx'),
    route('menu', './pages/MenuPage.tsx'),
    route('menu/:id', './pages/MenuItemDetailPage.tsx'),
    route('about', './pages/AboutPage.tsx'),
    route('contact', './pages/ContactPage.tsx'),
    route('blog', './pages/BlogPage.tsx'),
    route('blog/:slug', './pages/BlogPostPage.tsx'),
    route('reservation', './pages/ReservationPage.tsx'),
    route('cart', './pages/CartPage.tsx'),

    // Protected routes (require auth)
    layout('./components/auth/ProtectedLayout.tsx', [
      route('checkout', './pages/CheckoutPage.tsx'),
      route('orders', './pages/OrderHistoryPage.tsx'),
      route('orders/:id', './pages/OrderDetailPage.tsx'),
      route('profile', './pages/ProfilePage.tsx'),
    ]),

    // Guest routes (redirect if logged in)
    layout('./components/auth/GuestLayout.tsx', [
      route('login', './pages/LoginPage.tsx'),
      route('register', './pages/RegisterPage.tsx'),
      route('forgot-password', './pages/ForgotPasswordPage.tsx'),
    ]),

    // Catch-all 404
    route('*', './pages/NotFoundPage.tsx'),
  ]),
] satisfies RouteConfig
