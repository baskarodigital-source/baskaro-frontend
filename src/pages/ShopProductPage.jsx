import { Navigate, useParams } from 'react-router-dom'

/** Legacy `/shop/:id` URLs redirect to the shared product details page. */
export default function ShopProductPage() {
  const { productId } = useParams()
  return (
    <Navigate
      to={`/product/${encodeURIComponent(productId || '')}`}
      replace
      state={{ itemType: 'catalog' }}
    />
  )
}
