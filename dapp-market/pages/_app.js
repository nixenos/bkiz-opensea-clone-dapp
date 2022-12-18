import '../styles/globals.css'
import Link from 'next/link'

function MyApp({ Component, pageProps }) {
  return (
    <div className='items-center'>
      <nav className="border-b p-6 items-center text-center">
        <div className='flex-row'>
        <p className="text-4xl font-bold flex-row text-gray-700">Ryneczek Liddlla</p>
        </div>
        <center>
        <div className="flex mt-4">
          <Link href="/">
            <p className="mr-4 text-yellow-50 p-0.5 fl border-2 rounded border-blue-400 transition ease-in-out delay-150 bg-blue-400 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-400 hover:border-indigo-400 duration-300">
              Strona główna
            </p>
          </Link>
          <Link href="/create-nft">
            <p className="mr-6 text-yellow-50 p-0.5 fl border-2 rounded border-blue-400 transition ease-in-out delay-150 bg-blue-400 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-400 hover:border-indigo-400 duration-300">
              Stwórz własny token
            </p>
          </Link>
          <Link href="/my-nfts">
            <p className="mr-6 text-yellow-50 p-0.5 fl border-2 rounded border-blue-400 transition ease-in-out delay-150 bg-blue-400 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-400 hover:border-indigo-400 duration-300">
              Moje tokeny
            </p>
          </Link>
          <Link href="/dashboard">
            <p className="mr-6 text-yellow-50 p-0.5 fl border-2 rounded border-blue-400 transition ease-in-out delay-150 bg-blue-400 hover:-translate-y-1 hover:scale-110 hover:bg-indigo-400 hover:border-indigo-400 duration-300">
              Moje stoisko
            </p>
          </Link>
        </div>
        </center>
      </nav>
      <Component {...pageProps} />
    </div>
  )
}

export default MyApp