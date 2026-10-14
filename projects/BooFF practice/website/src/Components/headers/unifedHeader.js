import AdminHeader from "./individualHeaders/adminHeader.js";
import GeneralHeader from "./individualHeaders/generalHeader.js";
import RefereeHeader from "./individualHeaders/refereeHeader.js";
import CoachHeader from "./individualHeaders/coachHeader.js";

function unifiedHeader({role}) {
  return(
    <div>
        {   role === "referee" ? (
            <RefereeHeader />
        ) : role === "coach" ? (
            <CoachHeader />
        ) : role === "admin" ? (
            <AdminHeader />
        ) : <GeneralHeader />}
    </div>
  )
}

export default unifiedHeader;