package tunnel

type State struct {
	DeviceID string
	Path     string
	Latency  int
}

func MockState(deviceID string) State {
	return State{DeviceID: deviceID, Path: "direct", Latency: 27}
}
