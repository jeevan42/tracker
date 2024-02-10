import React, { useState } from 'react';
import './ChatBot.css';
import { AE_AMOUNT_FORMATS } from '@aeternity/aepp-sdk';

const Chatbot = ({ closeChatbot, instance, address, updateBalance , loginCheck, setLogin}) => {
  const [botMessages, setBotMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [publicKey, setPublicKey] = useState('ak_2QaAzpW4w4pnPNDdrgdLHu5v4bGMxVzUD2F16X3aUrayPcBzZm');
  const [amount, setAmount] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  let aci = [
    {
        "contract": {
            "functions": [
                {
                    "arguments": [],
                    "name": "init",
                    "payable": false,
                    "returns": "CharityTransfer.state",
                    "stateful": false
                },
                {
                    "arguments": [],
                    "name": "sendMoney",
                    "payable": true,
                    "returns": {
                        "tuple": []
                    },
                    "stateful": true
                },
                {
                    "arguments": [],
                    "name": "getContractDetails",
                    "payable": false,
                    "returns": "CharityTransfer.state",
                    "stateful": false
                }
            ],
            "kind": "contract_main",
            "name": "CharityTransfer",
            "payable": true,
            "state": {
                "record": [
                    {
                        "name": "user1",
                        "type": "address"
                    },
                    {
                        "name": "user2",
                        "type": "address"
                    },
                    {
                        "name": "amount",
                        "type": "int"
                    },
                    {
                        "name": "isConfirmed",
                        "type": "bool"
                    }
                ]
            },
            "typedefs": []
        }
    }
];
let bytecode =
    "cb_+QE0RgOg9VJwCt/1bunq4G0DoMIjvwztRQHnOmS4btUFfbgIcyPAuQEGuM3+Dv7QsgA3ADcERwBHAAcXDAKCDAKEDAKGDAKIJwwIAP5E1kQfADcANwBVAoIaDoSfAKDV2POv3jVbFg8fneTzQzjhJ42+W4ZvmRZh17lUxKBJaxoOhgAaDoh/AQM//qGAQw0ENwA3ACYIiAcMBPsDpVRyYW5zYWN0aW9uIGFscmVhZHkgY29uZmlybWVkIG9yIHJlamVjdGVkCwAfMAAHDAj7A31BbW91bnQgc2hvdWxkIGJlIGdyZWF0ZXIgdGhhbiAwCwAUCoaGAQM/sy8DEQ7+0LJJZ2V0Q29udHJhY3REZXRhaWxzEUTWRB8RaW5pdBGhgEMNJXNlbmRNb25leYIvAIU3LjQuMAFOSKJN";


  // const handleInputChange = (e) => {
  //   setUserInput(e.target.value);
  // };

  const handleSend = () => {
    // setBotMessages((prevMessages) => [
    //   ...prevMessages,
    //   { id: 'user', text: userInput },
    // ]);

    // if (transactionType === 'send' && userInput !== '' && !publicKey && !amount && !confirmSend) {
    //   setPublicKey(userInput);
    //   setBotMessages((prevMessages) => [
    //     ...prevMessages,
    //     { id: 'bot', text: 'Enter the amount to send:' },
    //   ]);
    // }
    if (transactionType === 'send' && publicKey && !amount && !confirmSend) {
      setAmount(userInput);
      setBotMessages((prevMessages) => [
        ...prevMessages,
        { id: 'bot', text: `Enter the amount to send:` },
      ]);
    } else if (transactionType === 'send' && publicKey && amount && !confirmSend) {
      setConfirmSend(true);
      setBotMessages((prevMessages) => [
        ...prevMessages,
        { id: 'bot', text: `Are you sure you want to send ${amount}?` },
      ]);
    } else if (transactionType === 'send' && publicKey && amount && confirmSend) {
      handleYes();
    }
  };

  const handleYes = async () => {
    try {
      const spendTo = publicKey; 
      const spendAmount = amount;
      console.log(spendTo) 

      const contract = await instance.initializeContract({ aci, bytecode, address: "ct_VAVZxayCvmd163vQGpGrNRmaZLfVMbRHnxSVAuwovGEDCjBCs" })
      console.log("contract", contract);


      // const sendMoneyResult = await contract.sendMoney("ak_cgWc8Rs7UcrmRu7VMXBCsG3mMaAKMmAnKgPWsWby5S5C5rhc3");
      // console.log(sendMoneyResult);
      const options1 = {
          amount: spendAmount * 1000000000000000000,
          callData: "",
          fee: null,
          gas: null,
          gasPrice: 1000000000,
      };
      const args = [];
      const options = Object.fromEntries(
          Object.entries(options1).filter(([, v]) => v != null),
      );

      contract
          ?.$call("sendMoney",args, options)
          .then((result) => {
              console.log(result);
              // setSpendPromise(result.hash)
              
              
              console.log(result);
              setBotMessages([
                ...botMessages,
                { id: 'bot', text: `Successfully sent ${amount} to recipient! Transaction Id: ${result.hash}` },
              ]);
              updateBalance();
              setLogin(!loginCheck)
              console.log(result);

          });
      
    } catch (error) {
      setBotMessages([
        ...botMessages,
        { id: 'bot', text: `Transaction failed: ${error.message}` },
      ]);
      console.error('Transaction failed:', error);
    }

    setConfirmSend(false);
    setUserInput('');
    setTransactionType('');
    setPublicKey(null);
    setAmount('');
  };

  const handleNo = () => {
    setBotMessages([
      ...botMessages,
      { id: 'bot', text: 'Transaction cancelled.' },
    ]);
    setConfirmSend(false);
    setUserInput('');
    setTransactionType('');
    setPublicKey(null);
    setAmount('');
  };

  const handleOptionSelection = (type) => {
    setTransactionType(type);
    // console.log("hhh");
    // console.log(type);

    if (type === 'send') {
      setTransactionType('send'); 
      setPublicKey('ak_2QaAzpW4w4pnPNDdrgdLHu5v4bGMxVzUD2F16X3aUrayPcBzZm');
      setBotMessages((prevMessages) => [
        ...prevMessages,
        { id: 'bot', text: `Enter the amount to send:` },
      ]);
    }
    if (type === 'getbalance') {
        console.log("hlo");
      getBalance();
    }
  };

  const getBalance = async () => {
    try {
        console.log("hl");
      const balance = await instance.getBalance(address, { format: AE_AMOUNT_FORMATS.AE });
      setBotMessages([
        ...botMessages,
        { id: 'bot', text: `Your current balance is ${balance}` },
      ]);
    } catch (error) {
      setBotMessages([
        ...botMessages,
        { id: 'bot', text: `Failed to retrieve balance: ${error.message}` },
      ]);
    }
  };

  const startChatAgain = () => {
    setBotMessages([]);
    setTransactionType('');
    setPublicKey('');
    setAmount('');
    setConfirmSend(false);
    setUserInput('');
  };
    return (
        <div className='fixed bottom-4 right-4 w-80 h-96 bg-white border border-gray-300 rounded-md shadow-md overflow-hidden chatbot'>
            
            <div className='flex justify-between items-center p-4 border-b border-gray-300 bg-gray-100'>
                <h2 className='text-lg font-bold'>Chatbot</h2>
                <button onClick={closeChatbot} className='focus:outline-none'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5 text-gray-600'
                        viewBox='0 0 20 20'
                        fill='currentColor'
                    >
                        <path
                            fillRule='evenodd'
                            d='M13.414 12l3.293 3.293a1 1 0 01-1.414 1.414L12 13.414l-3.293 3.293a1 1 0 01-1.414-1.414L10.586 12 7.293 8.707a1 1 0 011.414-1.414L12 10.586l3.293-3.293a1 1 0 111.414 1.414L13.414 12z'
                            clipRule='evenodd'
                        />
                    </svg>
                </button>
            </div>

            
            <div className='overflow-y-auto p-4 h-64 chatbot-messages'>
               
                
                    <div className='message bg-gray-200 p-2 rounded-md mb-2'>
                        Hello user, how can I help you today?
                    </div>
                {botMessages.map((message, index) => (
                    <div key={index} className='message bg-gray-200 p-2 rounded-md mb-2'>
                        {message.text}
                    </div>
                ))}
            </div>

            <div className='p-4 border-t border-gray-300 bg-gray-100'>
                
                {!transactionType && (
                    <div className='flex gap-2'>
                        <button
                            className='px-4 py-2 bg-blue-500 text-white rounded-md'
                            onClick={() => {
                              handleOptionSelection('send')
                              handleSend()}}
                        >
                            Send Money
                        </button>
                        <button
                            className='px-4 py-2 bg-blue-500 text-white rounded-md'
                            onClick={() => handleOptionSelection('getbalance')}
                        >
                           getBalance
                        </button>
                    </div>
                )}


                

                {transactionType === 'send' && publicKey && !confirmSend && (
                    <div className='flex gap-2'>
                        <input
                            type='text'
                            placeholder='Enter Amount'
                            className='flex-1 rounded-md p-2 border border-gray-300 focus:outline-none focus:ring focus:border-blue-500'
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                        />
                        <button
                            onClick={handleSend}
                            className='px-4 py-2 bg-blue-500 text-white rounded-md'
                        >
                            Next
                        </button>
                    </div>
                )}

               
                {confirmSend && (
                    <div className='flex gap-2'>
                        <button
                            onClick={handleYes}
                            className='px-4 py-2 bg-green-500 text-white rounded-md'
                        >
                            Yes
                        </button>
                        <button
                            onClick={handleNo}
                            className='px-4 py-2 bg-red-500 text-white rounded-md'
                        >
                            No
                        </button>
                    </div>
                )}

                
                <div className='flex justify-center mt-4'>
                    <button
                        onClick={startChatAgain}
                        className='px-4 py-2 bg-green-500 text-white rounded-md'
                        style={{ display: transactionType ? 'block' : 'none' }}
                    >
                        Start Chat Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;