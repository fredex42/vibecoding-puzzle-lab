import { Route, Routes } from 'react-router'

function RootPage() {
  return null
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<RootPage />} />
    </Routes>
  )
}

export default App
