import DualGovernanceModel from '../Plenary/DualGovernanceModel'
import HeroBanner from '../Plenary/HeroBanner'
import PlenaryPage from '../Plenary/PlenaryPage'
import PlenaryStructure from '../Plenary/PlenaryStructure'

export default function RouterPlenary() {
    return (
        <div>
            <HeroBanner />
            <PlenaryPage />
            <PlenaryStructure />
            <DualGovernanceModel />
        </div>
    )
}
