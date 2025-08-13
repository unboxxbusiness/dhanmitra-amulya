import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import LoginPage from '../page'

// Mock next/link
jest.mock('next/link', () => {
    return ({children, href}: {children: React.ReactNode, href: string}) => {
        return <a href={href}>{children}</a>
    }
})

describe('Login Page', () => {
  it('renders the main heading', () => {
    render(<LoginPage />)
 
    const heading = screen.getByRole('heading', { name: /welcome back to amulya/i })
 
    expect(heading).toBeInTheDocument()
  })
})
