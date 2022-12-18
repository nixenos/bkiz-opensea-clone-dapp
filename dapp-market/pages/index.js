import { ethers } from 'ethers'
import { useEffect, useState } from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  marketAddress
} from '../../config'

import DappMarket from '../../artifacts/contracts/DappMarket.sol/DappMarket.json'

export default function Home() {
  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(() => {
    loadNFTs()
  }, [])
  async function loadNFTs() {
    const provider = new ethers.providers.JsonRpcProvider()
    const contract = new ethers.Contract(marketAddress, DappMarket.abi, provider)
    const data = await contract.fetchProducts()
    const items = await Promise.all(data.map(async i => {
      try{
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
        description: meta.data.description,
      }
      return item
    } catch (error){
      console.log(error);
        let item = {
            price: 0,
            tokenId: "error",
            seller: "error",
            owner: "error",
            image: "error",
          }
          return item;
    }
    }))
    setNfts(items)
    setLoadingState('loaded') 
  }
  async function buyNft(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(marketAddress, DappMarket.abi, signer)

    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')   
    const transaction = await contract.createSale(nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }
  if (loadingState === 'loaded' && !nfts.length) return (<h1 className="px-20 py-10 text-3xl">Brak tokenów na sprzedaż</h1>)
  return (
    <div className="flex justify-center">
      <div className="px-4" style={{ maxWidth: '1600px' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
          {
            nfts.map((nft, i) => (
              <div key={i} className="border shadow rounded-xl overflow-hidden transition ease-in-out delay-150 hover:scale-105">
                <div className="p-4">
                  <p style={{ height: '64px' }} className="text-2xl font-semibold text-gray-700 text-center">{nft.name}</p>
                </div>
                <img src={nft.image} />
                <div className='p-4'>
                  <div style={{ height: '70px', overflow: 'hidden' }}>
                    <p className="text-gray-400">{nft.description}</p>
                  </div>
                </div>
                <div className="p-4 bg-gray-700">
                  <p className="text-2xl font-bold text-white">{nft.price} ETH</p>
                  <button className="mt-4 w-full bg-blue-400 text-yellow-50 font-bold py-2 px-12 rounded transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-105 hover:bg-indigo-400 duration-300" onClick={() => buyNft(nft)}>Kup</button>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  )
}