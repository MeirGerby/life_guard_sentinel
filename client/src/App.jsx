import './App.css'
import LoginPage from './pages/login_page/LoginPage'
import AddUserPage from './pages/add_user_page/AddUserPage'
import DeleteUserPage from './pages/delete_user_page/DeleteUserPage'
import UpdateUserPage from './pages/update_user_page/UpdateUserPage'
import { BrowserRouter, Routes, Route } from "react-router-dom"

function App() {

  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<LoginPage></LoginPage>}></Route>
          <Route path='/add_user' element={<AddUserPage></AddUserPage>}></Route>
          <Route path='/delete_user' element={<DeleteUserPage></DeleteUserPage>}></Route>
          <Route path='/update_user' element={<UpdateUserPage></UpdateUserPage>}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
