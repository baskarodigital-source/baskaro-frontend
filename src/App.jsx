// Routes: admin uses shared /login (see LoginPage redirectTo), not a separate admin login page.
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MainLayout } from './components/MainLayout'
import { Button } from './components/Button'
import LandingPage from './pages/LandingPage'
import HomePage from './pages/HomePage'
import BrandPage from './pages/BrandPage'
import MarketplacePage from './pages/MarketplacePage'
import LoginPage from './pages/LoginPage'
import UserDashboard from './pages/UserDashboard'
import SellPhonePage from './pages/SellPhonePage'
import SellCategoryPage from './pages/SellCategoryPage'
import SellSubPage from './pages/SellSubPage'
import SellDeviceCheckPage from './pages/SellDeviceCheckPage'
import SellDefectsPage from './pages/SellDefectsPage'
import SellFunctionalProblemsPage from './pages/SellFunctionalProblemsPage'
import SellAccessoriesPage from './pages/SellAccessoriesPage'
import SellModelDetailPage from './pages/SellModelDetailPage'
import AdminDashboard from './pages/AdminDashboard'
import BuyAccessoriesPage from './pages/BuyAccessoriesPage'
import RepairPhonePage from './pages/RepairPhonePage'
import FindNewPhonePage from './pages/FindNewPhonePage'
import FindNewGadgetsPage from './pages/FindNewGadgetsPage'
import FindNewGadgetsSectionPage from './pages/FindNewGadgetsSectionPage'
import BuyPreOwnedPage from './pages/BuyPreOwnedPage'
import BuyPreOwnedExplorePage from './pages/BuyPreOwnedExplorePage'
import BuyPreOwnedProductPage from './pages/BuyPreOwnedProductPage'
import NearbyStoresPage from './pages/NearbyStoresPage'
import { CartProvider } from './context/CartContext'
import { WishlistProvider } from './context/WishlistContext'
import CartPage from './pages/CartPage'
import WishlistPage from './pages/WishlistPage'
import ProductDetailsPage from './pages/ProductDetailsPage'
import ViewDetailsPage from './pages/ViewDetailsPage'
import AboutPage from './pages/AboutPage'
import WarrantyPolicyPage from './pages/WarrantyPolicyPage'
import ReferEarnPage from './pages/ReferEarnPage'
import CareersPage from './pages/CareersPage'
import PressReleasesPage from './pages/PressReleasesPage'
import ProfilePage from './pages/ProfilePage'
import InfoPage from './pages/InfoPage'

function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[60vh] w-full max-w-5xl flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">404</p>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Page not found</h1>
      <p className="max-w-md text-sm text-slate-600">
        The page you requested does not exist. Go back to the homepage.
      </p>
      <Button as="a" href="/" variant="primary">
        Go to Home
      </Button>
    </section>
  )
}

export default function App() {
  return (
    <CartProvider>
      <WishlistProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route
              path="/*"
              element={
                <MainLayout>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/brand/:brandName" element={<BrandPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/dashboard" element={<UserDashboard />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/sell/sub" element={<SellSubPage />} />
                    <Route path="/sell/device-check" element={<SellDeviceCheckPage />} />
                    <Route path="/sell/defects" element={<SellDefectsPage />} />
                    <Route path="/sell/functional-problems" element={<SellFunctionalProblemsPage />} />
                    <Route path="/sell/accessories" element={<SellAccessoriesPage />} />
                    <Route path="/sell/model-detail" element={<SellModelDetailPage />} />
                    <Route path="/sell/:category" element={<SellCategoryPage />} />
                    <Route path="/sell-phone" element={<SellPhonePage />} />
                    <Route path="/buy-accessories" element={<BuyAccessoriesPage />} />
                    <Route path="/buy-pre-owned/:kind/:slug" element={<BuyPreOwnedExplorePage />} />
                    <Route path="/buy-pre-owned/product/:kind/:slug/:productId" element={<BuyPreOwnedProductPage />} />
                    <Route path="/buy-pre-owned" element={<BuyPreOwnedPage />} />
                    <Route path="/marketplace" element={<MarketplacePage />} />
                    <Route path="/repair-phone" element={<RepairPhonePage />} />
                    <Route path="/find-new-gadgets" element={<FindNewGadgetsPage />} />
                    <Route path="/find-new-gadgets/explore/:slug" element={<FindNewGadgetsSectionPage />} />
                    <Route path="/find-new-gadgets/:slug" element={<FindNewGadgetsSectionPage />} />
                    <Route path="/find-new-phone" element={<FindNewPhonePage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/wishlist" element={<WishlistPage />} />
                    <Route path="/nearby-stores" element={<NearbyStoresPage />} />
                    <Route path="/product/:id" element={<ProductDetailsPage />} />
                    <Route path="/store/:storeId" element={<ViewDetailsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/new-offers" element={<InfoPage />} />
                    <Route path="/partner" element={<InfoPage />} />
                    <Route path="/contact" element={<InfoPage />} />
                    <Route path="/contact-us" element={<InfoPage />} />
                    <Route path="/warranty-policy" element={<WarrantyPolicyPage />} />
                    <Route path="/refer-earn" element={<ReferEarnPage />} />
                    <Route path="/careers" element={<CareersPage />} />
                    <Route path="/articles" element={<InfoPage />} />
                    <Route path="/become-partner" element={<InfoPage />} />
                    <Route path="/press-releases" element={<PressReleasesPage />} />
                    <Route path="/terms-and-conditions" element={<InfoPage />} />
                    <Route path="/landing" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </WishlistProvider>
    </CartProvider>
  )
}
