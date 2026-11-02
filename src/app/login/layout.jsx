// Private page: keep it out of Google results.
export const metadata = { robots: { index: false, follow: false } };

export default function Layout({ children }) {
  return children;
}
