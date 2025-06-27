import MeetingsSection from '../components/MeetingsSection';
import SuggestionsSection from '../components/SuggestionsSection';

export default function LearnPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Eat & Meet</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <MeetingsSection />
        <SuggestionsSection />
      </div>
    </div>
  );
}
