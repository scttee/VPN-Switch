package resource

type Resource struct {
	Name     string
	Protocol string
	Target   string
}

func DefaultCatalog(hostname string) []Resource {
	return []Resource{
		{Name: "Family Photos", Protocol: "https", Target: hostname + ":8443/photos"},
		{Name: "Kitchen Printer", Protocol: "tcp", Target: hostname + ":9100"},
	}
}
