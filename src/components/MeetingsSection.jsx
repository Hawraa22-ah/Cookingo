
// import React, { useState, useEffect, useMemo } from "react";
// // import { supabase } from "../supabaseclient";
// import { supabase } from "../utils/supabaseclient";
// import { useAuth } from "../contexts/AuthContext";
// import { Calendar, dateFnsLocalizer } from "react-big-calendar";
// import format from "date-fns/format";
// import parse from "date-fns/parse";
// import startOfWeek from "date-fns/startOfWeek";
// import getDay from "date-fns/getDay";
// import enUS from "date-fns/locale/en-US";
// import "react-big-calendar/lib/css/react-big-calendar.css";

// const locales = { "en-US": enUS };
// const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

// function AddMeetingForm({ onClose, onAdded, chefId }) {
//   const [title, setTitle] = useState("");
//   const [description, setDescription] = useState("");
//   const [startTime, setStartTime] = useState("");
//   const [meetUrl, setMeetUrl] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const { data, error } = await supabase.from("meetings").insert([
//         {
//           title,
//           description,
//           start_time: new Date(startTime).toISOString(),
//           meet_url: meetUrl,
//           chef_id: chefId,
//         },
//       ]).select().single();

//       if (error) {
//         alert(error.message || "Failed to add meeting.");
//       } else {
//         onAdded(data);
//       }
//     } catch (err) {
//       alert("Unexpected error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   if (role === 'guest') {
//     return <div>Please sign in to view meeting details.</div>;
//   }

//   return (
//     <form onSubmit={handleSubmit} className="space-y-2">
//       <label className="block">
//         Title
//         <input
//           required
//           className="w-full border p-1 rounded"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Description
//         <input
//           className="w-full border p-1 rounded"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Start Time
//         <input
//           required
//           type="datetime-local"
//           className="w-full border p-1 rounded"
//           value={startTime}
//           onChange={(e) => setStartTime(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Google Meet URL
//         <input
//           required
//           className="w-full border p-1 rounded"
//           value={meetUrl}
//           onChange={(e) => setMeetUrl(e.target.value)}
//         />
//       </label>
//       <div className="flex gap-2 mt-2">
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
//         >
//           {loading ? "Adding..." : "Add Meeting"}
//         </button>
//         <button
//           type="button"
//           className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
//           onClick={onClose}
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// }
// function EditMeetingForm({ meeting, onClose, onUpdated }) {
//   const [title, setTitle] = useState(meeting.title);
//   const [description, setDescription] = useState(meeting.description);

//   // SAFER: handles missing, ISO string, or Date object
//   const [startTime, setStartTime] = useState(() => {
//     if (!meeting.start_time) return "";
//     if (typeof meeting.start_time === "string") {
//       return meeting.start_time.slice(0, 16);
//     }
//     if (meeting.start_time instanceof Date) {
//       return meeting.start_time.toISOString().slice(0, 16);
//     }
//     return "";
//   });

//   const [meetUrl, setMeetUrl] = useState(meeting.meet_url);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from("meetings")
//         .update({
//           title,
//           description,
//           start_time: new Date(startTime).toISOString(),
//           meet_url: meetUrl,
//         })
//         .eq("id", meeting.id)
//         .select()
//         .single();

//       if (error) {
//         alert(error.message || "Failed to update meeting.");
//       } else {
//         onUpdated(data);
//       }
//     } catch (err) {
//       alert("Unexpected error: " + err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded bg-white max-w-md">
//       <h3 className="font-semibold mb-2">Edit Meeting</h3>
//       <label className="block">
//         Title
//         <input
//           required
//           className="w-full border p-1 rounded"
//           value={title}
//           onChange={(e) => setTitle(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Description
//         <input
//           className="w-full border p-1 rounded"
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Start Time
//         <input
//           required
//           type="datetime-local"
//           className="w-full border p-1 rounded"
//           value={startTime}
//           onChange={(e) => setStartTime(e.target.value)}
//         />
//       </label>
//       <label className="block">
//         Google Meet URL
//         <input
//           required
//           className="w-full border p-1 rounded"
//           value={meetUrl}
//           onChange={(e) => setMeetUrl(e.target.value)}
//         />
//       </label>
//       <div className="flex gap-2">
//         <button
//           type="submit"
//           disabled={loading}
//           className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
//         >
//           {loading ? "Saving..." : "Save Changes"}
//         </button>
//         <button
//           type="button"
//           className="px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
//           onClick={onClose}
//         >
//           Cancel
//         </button>
//       </div>
//     </form>
//   );
// }

// export default function MeetingsSection() {
//   const [meetings, setMeetings] = useState([]);
//   const { user, role } = useAuth();
//   const [selected, setSelected] = useState(null);
//   const [showAdd, setShowAdd] = useState(false);
//   const [showEdit, setShowEdit] = useState(false);

//   // Load meetings on mount
//   useEffect(() => {
//     (async () => {
//       const { data, error } = await supabase.from("meetings").select("*").order("start_time", { ascending: true });
//       if (error) {
//         console.error("Failed to load meetings:", error);
//       } else {
//         setMeetings(data || []);
//       }
//     })();
//   }, []);

//   const events = useMemo(
//     () =>
//       meetings.map((m) => ({
//         id: m.id,
//         title: m.title,
//         start: new Date(m.start_time),
//         end: new Date(new Date(m.start_time).getTime() + 60 * 60 * 1000),
//         description: m.description,
//         meet_url: m.meet_url,
//         chef_id: m.chef_id,
//       })),
//     [meetings]
//   );

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this meeting?")) return;
//     const { error } = await supabase.from("meetings").delete().eq("id", id);
//     if (error) {
//       alert("Delete failed: " + error.message);
//     } else {
//       setMeetings((ms) => ms.filter((m) => m.id !== id));
//       setSelected(null);
//     }
//   };

//   let detailStart, detailEnd;
//   if (selected) {
//     detailStart =
//       selected.start instanceof Date
//         ? selected.start
//         : new Date(selected.start_time);
//     detailEnd =
//       selected.end instanceof Date
//         ? selected.end
//         : new Date(new Date(selected.start_time).getTime() + 60 * 60 * 1000);
//   }

//   return (
//     <div>
//       <h2 className="text-xl font-semibold mb-4">Cooking Lessons Calendar</h2>
//       <div className="h-[500px] border rounded bg-white mb-4">
//         <Calendar
//           localizer={localizer}
//           events={events}
//           startAccessor="start"
//           endAccessor="end"
//           onSelectEvent={setSelected}
//           style={{ height: 500, padding: 10 }}
//         />
//       </div>

//       {selected && !showEdit && (
//         <div className="mb-4 border p-4 rounded bg-gray-50">
//           <h3 className="text-lg font-bold mb-1">{selected.title}</h3>
//           <p className="mb-1">
//             <span className="font-medium">When:</span>{" "}
//             {format(detailStart, "PPpp")} – {format(detailEnd, "p")}
//           </p>
//           <p className="mb-2">{selected.description}</p>
//           {selected.meet_url && (
//             <p className="mb-4">
//               <span className="font-medium">Link:</span>{" "}
//               <a
//                 href={selected.meet_url}
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="text-blue-600 hover:underline"
//               >
//                 {selected.meet_url}
//               </a>
//             </p>
//           )}
//           {role === "chef" && user.id === selected.chef_id && (
//             <div className="flex gap-2 mb-2">
//               <button
//                 className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
//                 onClick={() => setShowEdit(true)}
//               >
//                 Edit
//               </button>
//               <button
//                 className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
//                 onClick={() => handleDelete(selected.id)}
//               >
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       )}

//       {showEdit && selected && (
//         <EditMeetingForm
//           meeting={selected}
//           onClose={() => setShowEdit(false)}
//           onUpdated={(u) => {
//             setMeetings((ms) => ms.map((m) => (m.id === u.id ? u : m)));
//             setSelected(u);
//             setShowEdit(false);
//           }}
//         />
//       )}

//       {role === "chef" && !showEdit && (
//         <button
//           className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
//           onClick={() => setShowAdd(true)}
//         >
//           Add New Meeting
//         </button>
//       )}

//       {showAdd && (
//         <div className="mt-4 p-4 border rounded bg-white max-w-md">
//           <h3 className="font-semibold mb-2">Add New Meeting</h3>
//           <AddMeetingForm
//             onClose={() => setShowAdd(false)}
//             onAdded={(m) => {
//               setMeetings((prev) => [...prev, m]);
//               setShowAdd(false);
//             }}
//             chefId={user.id}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useState, useEffect, useMemo } from "react";
import { supabase } from "../utils/supabaseclient";
import { useAuth } from "../contexts/AuthContext";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

function AddMeetingForm({ onClose, onAdded, chefId }) {
  const { role } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [meetUrl, setMeetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Prevent guests from accessing the form
  if (role === "guest") {
    return <div className="text-red-600 mb-4">Please sign in to add meetings.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("meetings")
        .insert([
          {
            title,
            description,
            start_time: new Date(startTime).toISOString(),
            meet_url: meetUrl,
            chef_id: chefId,
          },
        ])
        .select()
        .single();

      if (error) {
        alert(error.message || "Failed to add meeting.");
      } else {
        onAdded(data);
      }
    } catch (err) {
      alert("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label className="block">
        Title
        <input
          required
          className="w-full border p-1 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block">
        Description
        <input
          className="w-full border p-1 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block">
        Start Time
        <input
          required
          type="datetime-local"
          className="w-full border p-1 rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </label>
      <label className="block">
        Google Meet URL
        <input
          required
          className="w-full border p-1 rounded"
          value={meetUrl}
          onChange={(e) => setMeetUrl(e.target.value)}
        />
      </label>
      <div className="flex gap-2 mt-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Adding..." : "Add Meeting"}
        </button>
        <button
          type="button"
          className="px-4 py-1 rounded bg-red-500 text-white hover:bg-red-600"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

function EditMeetingForm({ meeting, onClose, onUpdated }) {
  const [title, setTitle] = useState(meeting.title);
  const [description, setDescription] = useState(meeting.description);

  const [startTime, setStartTime] = useState(() => {
    if (!meeting.start_time) return "";
    if (typeof meeting.start_time === "string") {
      return meeting.start_time.slice(0, 16);
    }
    if (meeting.start_time instanceof Date) {
      return meeting.start_time.toISOString().slice(0, 16);
    }
    return "";
  });

  const [meetUrl, setMeetUrl] = useState(meeting.meet_url);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("meetings")
        .update({
          title,
          description,
          start_time: new Date(startTime).toISOString(),
          meet_url: meetUrl,
        })
        .eq("id", meeting.id)
        .select()
        .single();

      if (error) {
        alert(error.message || "Failed to update meeting.");
      } else {
        onUpdated(data);
      }
    } catch (err) {
      alert("Unexpected error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2 p-4 border rounded bg-white max-w-md">
      <h3 className="font-semibold mb-2">Edit Meeting</h3>
      <label className="block">
        Title
        <input
          required
          className="w-full border p-1 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <label className="block">
        Description
        <input
          className="w-full border p-1 rounded"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </label>
      <label className="block">
        Start Time
        <input
          required
          type="datetime-local"
          className="w-full border p-1 rounded"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
        />
      </label>
      <label className="block">
        Google Meet URL
        <input
          required
          className="w-full border p-1 rounded"
          value={meetUrl}
          onChange={(e) => setMeetUrl(e.target.value)}
        />
      </label>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-1 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
        <button
          type="button"
          className="px-4 py-1 rounded bg-gray-400 text-white hover:bg-gray-500"
          onClick={onClose}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function MeetingsSection() {
  const [meetings, setMeetings] = useState([]);
  const { user, role } = useAuth();
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  // Load meetings on mount
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("meetings")
        .select("*")
        .order("start_time", { ascending: true });
      if (error) {
        console.error("Failed to load meetings:", error);
      } else {
        setMeetings(data || []);
      }
    })();
  }, []);

  const events = useMemo(
    () =>
      meetings.map((m) => ({
        id: m.id,
        title: m.title,
        start: new Date(m.start_time),
        end: new Date(new Date(m.start_time).getTime() + 60 * 60 * 1000),
        description: m.description,
        meet_url: m.meet_url,
        chef_id: m.chef_id,
      })),
    [meetings]
  );

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this meeting?")) return;
    const { error } = await supabase.from("meetings").delete().eq("id", id);
    if (error) {
      alert("Delete failed: " + error.message);
    } else {
      setMeetings((ms) => ms.filter((m) => m.id !== id));
      setSelected(null);
    }
  };

  let detailStart, detailEnd;
  if (selected) {
    detailStart =
      selected.start instanceof Date
        ? selected.start
        : new Date(selected.start_time);
    detailEnd =
      selected.end instanceof Date
        ? selected.end
        : new Date(new Date(selected.start_time).getTime() + 60 * 60 * 1000);
  }

  // --- UI ---
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Cooking Lessons Calendar</h2>
      <div className="h-[500px] border rounded bg-white mb-4">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          onSelectEvent={
            role === "guest" || !user
              ? () => {}
              : setSelected
          }
          style={{ height: 500, padding: 10 }}
        />
      </div>

      {/* Details, but not for guests */}
      {selected && !showEdit && role !== "guest" && user && (
        <div className="mb-4 border p-4 rounded bg-gray-50">
          <h3 className="text-lg font-bold mb-1">{selected.title}</h3>
          <p className="mb-1">
            <span className="font-medium">When:</span>{" "}
            {format(detailStart, "PPpp")} – {format(detailEnd, "p")}
          </p>
          <p className="mb-2">{selected.description}</p>
          {selected.meet_url && (
            <p className="mb-4">
              <span className="font-medium">Link:</span>{" "}
              <a
                href={selected.meet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {selected.meet_url}
              </a>
            </p>
          )}
          {role === "chef" && user.id === selected.chef_id && (
            <div className="flex gap-2 mb-2">
              <button
                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                onClick={() => setShowEdit(true)}
              >
                Edit
              </button>
              <button
                className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                onClick={() => handleDelete(selected.id)}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guests see a warning instead */}
      {selected && !showEdit && (role === "guest" || !user) && (
        <div className="mb-4 border p-4 rounded bg-red-50 text-red-600">
          Please sign in to view meeting details.
        </div>
      )}

      {showEdit && selected && (
        <EditMeetingForm
          meeting={selected}
          onClose={() => setShowEdit(false)}
          onUpdated={(u) => {
            setMeetings((ms) => ms.map((m) => (m.id === u.id ? u : m)));
            setSelected(u);
            setShowEdit(false);
          }}
        />
      )}

      {/* Only chefs can see the add button, and never guests */}
      {role === "chef" && !showEdit && user && (
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => setShowAdd(true)}
        >
          Add New Meeting
        </button>
      )}

      {/* Add form is always protected */}
      {showAdd && (
        <div className="mt-4 p-4 border rounded bg-white max-w-md">
          <h3 className="font-semibold mb-2">Add New Meeting</h3>
          <AddMeetingForm
            onClose={() => setShowAdd(false)}
            onAdded={(m) => {
              setMeetings((prev) => [...prev, m]);
              setShowAdd(false);
            }}
            chefId={user.id}
          />
        </div>
      )}
    </div>
  );
}
