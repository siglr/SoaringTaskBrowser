class WSG_Weather {
    constructor() {
        this.name = null;
        this.image = null;
        this.icon = null;
        this.layeredImage = null;
        this.isAltitudeAMGL = null;
        this.cloudLayers = [];
        this.windLayers = [];
        this.mslPressure = null;
        this.mslTemperature = null;
        this.aerosolDensity = null;
        this.pollution = null;
        this.precipitations = null;
        this.snowCover = null;
        this.thunderstormIntensity = null;
    }

    load_wpr_str(wpr_str) {
        const parser = new DOMParser();
        const dom = parser.parseFromString(wpr_str, "application/xml");
        const preset = dom.querySelector("WeatherPreset.Preset");

        // Basic Information
        this.name = this.getTextContent(preset, "Name");
        this.image = this.getTextContent(preset, "Image");
        this.icon = this.getTextContent(preset, "Icon");
        this.layeredImage = this.getTextContent(preset, "LayeredImage");
        this.isAltitudeAMGL = this.getTextContent(preset, "IsAltitudeAMGL") === "True";

        // Cloud Layers
        const cloudLayers = preset.getElementsByTagName("CloudLayer");
        for (let layer of cloudLayers) {
            this.cloudLayers.push({
                density: this.getAttribute(layer, "CloudLayerDensity", "Value"),
                coverage: this.getAttribute(layer, "CloudLayerCoverage", "Value"),
                altitudeBot: this.getAttribute(layer, "CloudLayerAltitudeBot", "Value"),
                altitudeTop: this.getAttribute(layer, "CloudLayerAltitudeTop", "Value"),
                scattering: this.getAttribute(layer, "CloudLayerScattering", "Value"),
            });
        }

        // Wind Layers
        const windLayers = preset.getElementsByTagName("WindLayer");
        for (let layer of windLayers) {
            this.windLayers.push({
                altitude: this.getAttribute(layer, "WindLayerAltitude", "Value"),
                angle: this.getAttribute(layer, "WindLayerAngle", "Value"),
                speed: this.getAttribute(layer, "WindLayerSpeed", "Value"),
            });
        }

        // Other Weather Parameters
        this.mslPressure = this.getAttribute(preset, "MSLPressure", "Value");
        this.mslTemperature = this.getAttribute(preset, "MSLTemperature", "Value");
        this.aerosolDensity = this.getAttribute(preset, "AerosolDensity", "Value");
        this.pollution = this.getAttribute(preset, "Pollution", "Value");
        this.precipitations = this.getAttribute(preset, "Precipitations", "Value");
        this.snowCover = this.getAttribute(preset, "SnowCover", "Value");
        this.thunderstormIntensity = this.getAttribute(preset, "ThunderstormIntensity", "Value");
    }

    getTextContent(parent, tagName) {
        const element = parent.getElementsByTagName(tagName)[0];
        return element ? element.textContent : null;
    }

    getAttribute(parent, tagName, attrName) {
        const element = parent.getElementsByTagName(tagName)[0];
        return element ? element.getAttribute(attrName) : null;
    }
}
