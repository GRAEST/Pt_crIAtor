export interface Tool {
  id: string
  name: string
  description: string
  url: string
  icon: string
  role: 'developer' | 'manager'
  disabled?: boolean
}

export interface Announcement {
  id: string
  message: string
  type: 'info' | 'warning' | 'success'
  date: string
  active: boolean
}
