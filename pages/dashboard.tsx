import { redirect } from "next/dist/server/api-utils"
import { destroyCookie } from "nookies"
import { useContext, useEffect } from "react"
import { Can } from "../components/Can"
import { AuthContext } from "../context/AuthContext"
import { useCan } from "../hooks/useCan"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"
import { AuthTokenError } from "../services/errors/AuthTokenError"
import { withSSRAuth } from "../utils/withSSRAuth"


export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext)


  useEffect(() => {
    api.get('/me').then(response => console.log(response))
      .catch(err => console.error(err))
  })

  return (
    <>
      <h1>Dashboard {user?.email}</h1>
        {/* aqui */}
        <button onClick={signOut}> Sign out</button>

      <Can permissions={['metrics.list']}>
        <div>Metricas</div>
      </Can>

    </>
  )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)
  const response = await apiClient.get('/me');

  return {
    props: {}
  }
})