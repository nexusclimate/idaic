import { useState } from 'react';
import { Dialog, DialogTitle, DialogBody, DialogActions } from './dialog';
import { Button } from './button';
import { Text } from './text';

export default function DisclaimerPopup({ isOpen, onAccept, onDecline, onNavigateToFeedback }) {
  const [hasScrolled, setHasScrolled] = useState(false);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
    if (isAtBottom) {
      setHasScrolled(true);
    }
  };

  return (
    <Dialog open={isOpen} onClose={() => {}} size="2xl">
      <DialogTitle>Welcome to IDAIC Portal - Terms & Conditions</DialogTitle>
      
      <DialogBody>
        <div 
          className="max-h-[30rem] overflow-y-auto pr-2 space-y-4"
          onScroll={handleScroll}
        >
          <Text>
            Welcome to the Industrial Decarbonization AI Coalition (IDAIC) Portal. 
            By using this platform, you agree to the following terms and conditions:
          </Text>

        <div className="space-y-3">
          <div>
            <Text className="font-semibold text-zinc-900 dark:text-white">
              Platform Purpose
            </Text>
            <Text>
              This portal is designed for IDAIC members to share information, collaborate on projects, 
              and connect with like-minded individuals interested in industrial development and AI initiatives. 
              The platform is intended for professional networking and knowledge sharing within our community.
            </Text>
          </div>

            <div>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Data Storage & Privacy
              </Text>
              <Text>
                Your personal information and data shared on this platform are stored securely and used 
                solely for the purpose of facilitating communication and collaboration within the IDAIC community. 
                We respect your privacy and will not share your information with third parties without your consent.
              </Text>
            </div>

            <div>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Community Guidelines
              </Text>
              <Text>
                • Use the platform for sharing relevant information and fostering meaningful discussions<br/>
                • Respect other members and maintain a professional tone<br/>
                • Do not use the platform for solicitation or commercial purposes<br/>
                • Share content that aligns with IDAIC's mission and values<br/>
                • Report any inappropriate behavior or content
              </Text>
            </div>

            <div>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Content Responsibility
              </Text>
              <Text>
                You are responsible for the content you share on this platform. Please ensure that any 
                information, documents, or communications you post are accurate, relevant, and appropriate 
                for our professional community.
              </Text>
            </div>

            <div>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Support & Contact
              </Text>
              <Text>
                If you have any questions, concerns, or need to remove your account, please contact us at:
                <br/>• Email: <a href="mailto:info@idaic.org" className="text-orange-600 hover:text-orange-700 underline">info@idaic.org</a>
                <br/>• Use the <button onClick={onNavigateToFeedback} className="text-orange-600 hover:text-orange-700 underline bg-transparent border-none p-0 cursor-pointer">feedback form</button> available in the portal
                <br/>• We're here to help and ensure a positive experience for all members
              </Text>
            </div>

            <div>
              <Text className="font-semibold text-zinc-900 dark:text-white">
                Agreement
              </Text>
              <Text>
                By clicking "I Accept" below, you acknowledge that you have read, understood, and agree to 
                these terms and conditions. You understand that this platform is for professional use within 
                the IDAIC community and agree to use it responsibly.
              </Text>
            </div>
          </div>
        </div>
      </DialogBody>

      <DialogActions>
        <Button 
          color="red" 
          outline 
          onClick={onDecline}
        >
          Decline & Exit
        </Button>
        <Button 
          color="orange" 
          onClick={onAccept}
          disabled={!hasScrolled}
        >
          I Accept
        </Button>
      </DialogActions>
    </Dialog>
  );
}
