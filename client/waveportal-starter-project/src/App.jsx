import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json";

const App = () => {

  //State variable we use to store our user's public wallet.

  const [currentAccount, setCurrentAccount] = useState("");
  
  //All state property to store all waves
  const [allWaves, setAllWaves] = useState([]);

  /**
   * Create a variable here that holds the contract address after you   deploy!
   */
  const contractAddress = "0xCdF43Ba2DBb927d2e92f5519a9008a07ba46d571";

  const contractABI = abi.abi;

  const getAllWaves = async () => {
    const { ethereum } = window;
    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        //WHERE WE PULL FROM WAVEPORTAL.SOL
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        //Snag allWaves method from smart contract
        const waves = await wavePortalContract.getAllWaves();
        
        const wavesCleaned = waves.map(wave => {
          return{
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message,
          };
        });

        //Store data in React State
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  let connected = false;
  let Authorized = false;

  const checkIfWalletIsConnected = async () => {
    try {
      /*
      * First make sure we have access to window.ethereum !!!!
      */
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
      } else {
        console.log("We have the ethereum object", ethereum);
        connected = true;
      }

      //Check if we are authorized to access user's wallet

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length != 0) {
        const account = accounts[0];
        setCurrentAccount(account)
        Authorized = true;
      } else {
        console.log("No authorized account found")
      }

      if (connected = True && Authorized == True) {
        getAllWaves();
      }

    } catch (error) {
      console.log(error);
    }
  }


  const [message, setMessage] = useState(null)
  function getData(val) {
    setMessage(val.target.value)
    console.warn(val.target.value);
  }


  //IMPLEMENT CONNECTWALLET METHOD
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);

    } catch (error) {
      console.log(error);
    }
  }

  /* WAVE FUNCTION*/
  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);


        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());


        /* Execute wave from smart contract*/
        const waveTxn = await wavePortalContract.wave(message, {gasLimit: 300000});
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }



  /*
  * This runs our function when the page loads.
  */
  useEffect(() => {
    checkIfWalletIsConnected();
    let wavePortalContract;

    const onNewWave = (from, timestamp, message) => {
      console.log("NewWave", from, timestamp, message);
      setAllWaves(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          message: message,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
  
      wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      wavePortalContract.on("NewWave", onNewWave);
    }

    return () => {
      if (wavePortalContract) {
        wavePortalContract.off("NewWave", onNewWave);
      }
    };
    }, [])

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
          👋 Hey there!
        </div>

        <div className="bio">
          I am Kyle Stanford and I am on my way to become a Blockchain Developer! This is my first project, I hope you enjoy it!
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at your boy!
        </button>


        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {/*
        * mapping the waves fields
        */}
        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>


          )
        })}
        
        <input className="messageBox" type="text" onChange={getData}/>
        
      </div>
    </div>
  );
}

export default App