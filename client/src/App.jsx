import './App.css'
import { Toaster } from 'react-hot-toast'

function App() {

  return (
    <>
    <Toaster position="top-center" reverseOrder={false} />
    <h1 className='text-3xl font-bold underline text-center mt-10'>
      Hello world!
    </h1>
    </>
  )
}

export default App
