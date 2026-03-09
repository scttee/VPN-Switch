package enroll

type Device struct {
	ID       string
	Name     string
	Hostname string
}

func FromToken(token string) Device {
	return Device{ID: "dev-demo", Name: "Home Mini PC", Hostname: "home-mini.kin"}
}
