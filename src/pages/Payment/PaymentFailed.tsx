


const PaymentFailed = () => {
  return (
    <div className='bg-slate-200 mt-24 w-full max-w-md mx-auto flex justify-center items-center flex-col p-4 m-2 rounded'>
          <img
            src={"https://res.cloudinary.com/dvzxjqtub/image/upload/v1754159936/cancel_vwxwc2.gif"}
            width={150}
            height={150}
            alt='success'
          />
          <p className='text-green-600 font-bold text-xl'>Payment Failed</p>
        </div>
  )
}

export default PaymentFailed