import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null)
	const [session, setSession] = useState(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		// Get initial session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		// Subscribe to auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session)
			setUser(session?.user ?? null)
			setLoading(false)
		})

		return () => subscription.unsubscribe()
	}, [])

	const signUp = async (email, password) => {
		const { data, error } = await supabase.auth.signUp({
			email,
			password,
		})
		if (error) throw error
		return data
	}

	const signIn = async (email, password) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		})
		if (error) throw error
		return data
	}

	const signOut = async () => {
		const { error } = await supabase.auth.signOut()
		if (error) throw error
	}

	const getSession = async () => {
		const { data: { session } } = await supabase.auth.getSession()
		return session
	}

	const value = {
		user,
		session,
		loading,
		signUp,
		signIn,
		signOut,
		getSession,
	}

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
	const ctx = useContext(AuthContext)
	if (!ctx) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return ctx
}
