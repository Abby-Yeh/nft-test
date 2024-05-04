import { ethers } from "ethers";
import { useState } from "react";
import Web3Modal from "web3modal";
//import {create as ipfsHttpClient} from 'ipfs-http-client'
import { nftaddress, nftmarketaddress } from "../config";
import NFT from "../artifacts/contracts/NFT.sol/NFT.json";
import { useRouter } from "next/router";
import KBMarket from "../artifacts/contracts/KBMarket.sol/KBMarket.json";

// in this component we set the ipfs up to host our nft data of
// file storage
const ipfsClient = require("ipfs-http-client");
const projectId = "2FcjUHGkvmh86HWFWtKzLccn4nn";
const projectSecret = "198d0b9ce432524ce7084c3add401d8b";
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
//export var txn = "TXNumber"

const client = ipfsClient.create({
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  headers: {
    authorization: auth,
  },
});

//client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const subdomain = "https://gradgateways123.infura-ipfs.io";
export default function MintItem() {
  const [fileUrl, setFileUrl] = useState(null);
  const [formInput, updateFormInput] = useState({
    price: "",
    name: "",
    description: "",
  });
  const router = useRouter();

  // set up a function to fireoff when we update files in our form - we can add our
  // NFT images - IPFS

  async function onChange(e) {
    const file = e.target.files[0];
    try {
      const added = await client.add(file, {
        progress: (prog) => console.log(`received: ${prog}`),
      });
      //const url = `https://ipfs.infura.io/ipfs/${added.path}`
      const url = `${subdomain}/ipfs/${added.path}`;
      console.log(url);
      alert(
        "Please save your file url for verification. Your url link is " + url
      );
      setFileUrl(url);
    } catch (error) {
      console.log("Error uploading file:", error);
    }
  }

  async function createItem() {
    const { name, description, price } = formInput;
    if (!name || !description || !price || !fileUrl) return;
    // upload metadata to IPFS
    const data = JSON.stringify({
      name,
      description,
      image: fileUrl,
    });
    //console.log('mint-item.js Metadata:',data)
    try {
      const added = await client.add(data);
      const url = `${subdomain}/ipfs/${added.path}`;
      //const url = `https://ipfs.infura.io/ipfs/${added.path}`
      // run a function that creates sale and passes in the url
      createSale(url);
    } catch (error) {
      console.log("Error uploading file:", error);
    }
  }

  async function createSale(url) {
    // create the items and list them on the marketplace
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();

    // create the token
    let contract = new ethers.Contract(nftaddress, NFT.abi, signer);
    let transaction = await contract.mintToken(url);
    let tx = await transaction.wait();
    //console.log("TX is : ",tx)
    //let txn = tx.transactionHash
    //window.alert(txn);
    //console.log("transactionHash is: ", txn)
    let event = tx.events[0];
    let value = event.args[2];
    //console.log("Value is : " ,value)
    let tokenId = value.toNumber();
    const price = ethers.utils.parseUnits(formInput.price, "ether");
    // list the item for sale on the marketplace
    contract = new ethers.Contract(nftmarketaddress, KBMarket.abi, signer);
    let listingPrice = await contract.getListingPrice();
    listingPrice = listingPrice.toString();
    transaction = await contract.makeMarketItem(nftaddress, tokenId, price, {
      value: listingPrice,
    });
    await transaction.wait();
    //console.log("transaction is",transaction)
    router.push("./");
  }

  return (
    <div className='flex justify-center'>
      <div className='w-1/2 flex flex-col pb-12'>
        <input
          placeholder='Asset Name'
          className='mt-2 border rounded p-4'
          onChange={(e) =>
            updateFormInput({ ...formInput, name: e.target.value })
          }
        />
        <textarea
          placeholder='Asset Description'
          className='mt-2 border rounded p-4'
          onChange={(e) =>
            updateFormInput({ ...formInput, description: e.target.value })
          }
        />
        <input
          placeholder='Asset Price in Eth'
          className='mt-2 border rounded p-4'
          onChange={(e) =>
            updateFormInput({ ...formInput, price: e.target.value })
          }
        />
        <input type='file' name='Asset' className='mt-4' onChange={onChange} />{" "}
        {fileUrl && (
          <img className='rounded mt-4' width='350px' src={fileUrl} />
        )}
        <button
          onClick={createItem}
          className='font-bold mt-4 bg-white text-black rounded p-4 shadow-lg'
        >
          Mint NFT
        </button>
      </div>
    </div>
  );
}
