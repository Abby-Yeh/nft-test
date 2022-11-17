import {ethers} from 'ethers'
import {useEffect, useState} from 'react'
import axios from 'axios'
import Web3Modal from 'web3modal'
import { nftaddress, nftmarketaddress } from '../config'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import KBMarket from '../artifacts/contracts/KBMarket.sol/KBMarket.json'

// @refresh reset
export default function Home() {
  const [nfts, setNFts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  useEffect(()=> {
    loadNFTs()
  }, [])

  async function loadNFTs() {
    // what we want to load:
    // ***provider, tokenContract, marketContract, data for our marketItems***
    //const lastBlockNumber = await Web3Modal.eth.getBlockNumber();
    const provider = new ethers.providers.JsonRpcProvider()
    
    await provider.ready
    
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    
    const marketContract = new ethers.Contract(nftmarketaddress, KBMarket.abi, provider)
    const data = await marketContract.fetchMarketTokens()
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      
      // we want get the token metadata - json 
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
    }))
    setNFts(items)
    setLoadingState('loaded')
  }

  // function to buy nfts for market 

  async function buyNFT(nft) {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer)
    const price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    const transaction = await contract.createMarketSale(nftaddress,nft.tokenId, {
      value: price
    })
    await transaction.wait()
    loadNFTs()
  }

  if(loadingState === 'loaded' && !nfts.length) return (<h1
  className='px-20 py-7 text-8x1 text-white'> There is No NFT in marketplace now! </h1>)

  return (
    <div className='flex justify-center'>
          <div className='px-4' style={{maxWidth: '2000px'}}>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4'>
            {
              nfts.map((nft, i)=>(
                <div key={i} className='border shadow rounded-x1 overflow-hidden'>
                  <img src={nft.image} />
                  <div className='p-4 bg-gray-900'>
                    <p className='text-3x1 font-semibold text-white' >{nft.name}</p>
                    <p className='text-3x1 mb-4 font-bold text-white'>{nft.description}</p>  
                  </div>
                  <div className='p-4 bg-gray-900'>
                    <p className='text-xs text-white' align="Left"> The owner & minter is {nft.seller}</p>
                    <p className='text-xs text-white' align="Left">Verify this asset by clicking
                    <a href="https://etherscan.io/" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-xs px-1 py-0.5 mr-1 mb-1 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">HERE</a> </p>

                  </div>
                      
                </div>
              ))
            }
          </div>
          </div>
    </div>
  )
}
