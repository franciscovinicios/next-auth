import { createContext, ReactNode, useEffect, useState } from "react";
import { setCookie, parseCookies, destroyCookie } from 'nookies' // salvar uma nova informacoes no cookies
import Router from "next/router"
import { api } from "../services/apiClient";



type signInCredentials = {
  email: string,
  password: string
}

/* como aqui a gente ja tem uma funcao que singout a gente 
fala que o contexto retorna ele tbm */
type AuthContextData = {
  signIn: (credentials: signInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
}

type AuthProviderProps = {
  children: ReactNode;
}

type User = {
  email: string
  permissions: string[],
  roles: string[],
}

export const AuthContext = createContext({} as AuthContextData)

let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'nextauth.token')
  destroyCookie(undefined, 'nextauth.refreshToken')

  Router.push('/')

  authChannel.postMessage('signOut')
}


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>(); // sao essas as infomacoes retornadas
  const isAuthenticated = !!user;

  

  useEffect(() => {
    authChannel = new BroadcastChannel('auth')

    authChannel.onmessage = (mesage) => {
      switch (mesage.data) {
        case 'signOut' :
          signOut();
          break;
        default :
          break;
      }
    }
  },[])


  useEffect(() => {
    const { 'nextauth.token': token } = parseCookies()

    if (token) {
      api.get('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({ email, permissions, roles })
      })
    }
  }, [])


  async function signIn({ email, password }: signInCredentials) {
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const { token, refreshToken, permissions, roles } = response.data

      setCookie(undefined, 'nextauth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
      setCookie(undefined, 'nextauth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })


      setUser({
        email,
        permissions,
        roles,
      })

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')

    } catch (err) {
      console.error(err)
    }
  }


  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}