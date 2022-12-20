import type { AppProps } from "next/app";
import Header from "../components/Header/Header";
import Footer from "../components/Footer/Footer";
import "../styles/globals.scss";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div className="app-container">
      <Header />
      <div id="app-content-container">
        <Component {...pageProps} />
      </div>
      <div id="home-footer-spacer" />
      <Footer />
    </div>
  );
}
