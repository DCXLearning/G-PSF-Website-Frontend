import DualGovernanceModel from '../Plenary/DualGovernanceModel'
import HeroBanner from '../Plenary/HeroBanner'
import OperatingMechanismsBanner from '../Plenary/OperatingMechanismsBanner'
import PlenaryPage from '../Plenary/PlenaryPage'
import PlenaryProcessFlow from '../Plenary/PlenaryProcessFlow'
import PlenaryStructure from '../Plenary/PlenaryStructure'

export default function RouterPlenary() {
    return (
        <div>
            <HeroBanner />
            <PlenaryPage />
            <PlenaryStructure />
            <DualGovernanceModel />
            <OperatingMechanismsBanner />
            <PlenaryProcessFlow />
        </div>
    )
}
