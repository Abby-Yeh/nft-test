import "../styles/globals.css";
import "./app.css";
import Link from "next/link";

function NFTMarketplace({ Component, pageProps }) {
  return (
    <div>
      <nav className='border-b p-6' style={{ backgroundColor: "#154c79" }}>
        <p className='text-9x1 font-bold text-white'>
          {" "}
          Graduate Certification NFT Marketplace{" "}
        </p>
        <div className='flex mt-6 justify-center'>
          <Link legacyBehavior href='/'>
            <a className='mr-6' id='link'>
              Main Marketplace
            </a>
          </Link>

          <Link legacyBehavior href='/mint-item'>
            <a className='mr-6' id='link'>
              Mint NFT
            </a>
          </Link>
        </div>
      </nav>
      <Component {...pageProps} />
    </div>
  );
}

export default NFTMarketplace;
