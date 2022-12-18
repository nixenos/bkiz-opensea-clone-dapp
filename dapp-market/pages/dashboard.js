/* pages/dashboard.js */
import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketAddress
} from '../../config'

import DappMarket from '../../artifacts/contracts/DappMarket.sol/DappMarket.json'

export default function CreatorDashboard() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const web3Modal = new Web3Modal({
      network: 'mainnet',
      cacheProvider: true,
    })
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(marketAddress, DappMarket.abi, signer)
    const data = await contract.fetchProductsListed()

    const items = await Promise.all(data.map(async i => {
    try {
      const tokenUri = await contract.tokenURI(i.tokenId)
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.price.toString(), 'ether')
      let item = {
        price,
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: meta.data.image,
        name: meta.data.name,
        description: meta.data.description
      }
      return item
    }
    catch (error) {
        console.log(error);
        let item = {
            price: 0,
            tokenId: "error",
            seller: "error",
            owner: "error",
            image: "error",
            name: "error",
            description: "error"
          }
          return item;
    }
    }))

    setNfts(items)
    setLoadingState('loaded') 
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No NFTs listed</h1>)
  return (
    <div>
      <div className="p-4">
        <h2 className="text-2xl py-2 text-gray-700">Przedmioty wystawione na sprzedaż</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden transition ease-in-out delay-150 hover:scale-105">
                <div className="p-4">
                  <p className="text-2xl font-semibold text-gray-700 text-center p-1">{nft.name}</p>
                </div>
                <img src={nft.image} className="rounded" />
                <div className="p-4 bg-gray-700">
                  <p className="text-2xl font-bold text-yellow-50">Cena: {nft.price} ETH</p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}
