package main

import (
	"fmt"
	"time"

	"kinlink-agent/internal/enroll"
	"kinlink-agent/internal/health"
	"kinlink-agent/internal/resource"
	"kinlink-agent/internal/tunnel"
)

func main() {
	fmt.Println("Kinlink Agent starting")
	device := enroll.FromToken("demo-token")
	state := tunnel.MockState(device.ID)
	checks := health.Run(state)
	published := resource.DefaultCatalog(device.Hostname)
	fmt.Printf("Device %s (%s) status=%s checks=%d resources=%d at=%s\n", device.Name, device.Hostname, state.Path, len(checks), len(published), time.Now().UTC().Format(time.RFC3339))
}
