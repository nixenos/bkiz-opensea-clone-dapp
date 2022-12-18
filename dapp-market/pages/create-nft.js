/* pages/create-nft.js */
import { useState } from 'react'
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import {
  REACT_APP_PROJECT_ID, REACT_APP_PROJECT_SECRET
} from '../../secrets'
const projectId = REACT_APP_PROJECT_ID;
const projectSecret = REACT_APP_PROJECT_SECRET;
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');
const client = ipfsHttpClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https', headers: {Authorization: auth}, mode: 'no-cors'})
//const client = ipfsHttpClient({host: 'ipfs.infura.io', port: 5001, protocol: 'https', mode: 'no-cors'})

import {
  marketAddress
} from '../../config'

import DappMarket from '../../artifacts/contracts/DappMarket.sol/DappMarket.json'

export default function CreateItem() {
  const [fileUrl, setFileUrl] = useState(null)
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
  const router = useRouter()
  console.log("Project id: " + REACT_APP_PROJECT_ID);
  console.log("Project secret: " + REACT_APP_PROJECT_SECRET);

  async function onChange(e) {
    /* upload image to IPFS */
    const file = e.target.files[0]
    try {
      const added = await client.add(
        file,
        {
          progress: (prog) => console.log(`received: ${prog}`)
        }
      )
      const url = `https://nxn-bkiza-project.infura-ipfs.io/ipfs/${added.path}`
      //const filePath = added.path;
      setFileUrl(url)
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }
  async function uploadToIPFS() {
    const { name, description, price } = formInput
    if (!name || !description || !price || !fileUrl) return
    /* first, upload metadata to IPFS */
    const data = JSON.stringify({
      name, description, image: fileUrl
    })
    try {
      const added = await client.add(data)
      const url = `https://nxn-bkiza-project.infura-ipfs.io/ipfs/${added.path}`
      const dataPath = added.path;
      console.log(added);
      /* after metadata is uploaded to IPFS, return the URL to use it in the transaction */
      return url
    } catch (error) {
      console.log('Error uploading file: ', error)
    }  
  }

  async function listNFTForSale() {
    const url = await uploadToIPFS()
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    /* create the NFT */
    const price = ethers.utils.parseUnits(formInput.price, 'ether')
    let contract = new ethers.Contract(marketAddress, DappMarket.abi, signer)
    let listingPrice = await contract.getListingPrice()
    listingPrice = listingPrice.toString()
    let transaction = await contract.createToken(url, price, { value: listingPrice })
    await transaction.wait()

    router.push('/')
  }

  return (
    <div className="flex justify-center">
      <div className="w-1/2 flex flex-col pb-12">
        <input 
          placeholder="Nazwa przedmiotu"
          className="mt-8 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
        />
        <textarea
          placeholder="Opis przedmiotu"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
        />
        <input
          placeholder="Cena przedmiotu (ETH)"
          className="mt-2 border rounded p-4"
          onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
        />
        <input
          type="file"
          name="Asset"
          className="my-4"
          onChange={onChange}
        />
        {
          fileUrl && (
            <img className="rounded mt-4" width="350" src={fileUrl} />
          )
        }
        <button onClick={listNFTForSale} className="font-bold mt-4 bg-blue-400 text-yellow-50 rounded p-4 shadow-lg ">
          Stwórz token
        </button>
      </div>
    </div>
  )
}
