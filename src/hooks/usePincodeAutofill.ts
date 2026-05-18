import { useState, useEffect } from 'react';
import axios from 'axios';

interface PostOffice {
  Name: string;
  District: string;
  State: string;
}

export function usePincodeAutofill(pincode: string) {
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [areas, setAreas] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only call API if pincode is exactly 6 digits
    if (!/^\d{6}$/.test(pincode)) {
      setDistrict('');
      setState('');
      setAreas([]);
      setError('');
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError('');

    axios.get(`https://api.postalpincode.in/pincode/${pincode}`)
      .then((res) => {
        if (isCancelled) return;
        
        const data = res.data[0];
        if (data.Status === 'Success' && data.PostOffice?.length > 0) {
          const offices: PostOffice[] = data.PostOffice;
          setDistrict(offices[0].District);
          setState(offices[0].State);
          setAreas(offices.map(o => o.Name));
          setError('');
        } else {
          setDistrict('');
          setState('');
          setAreas([]);
          setError('Invalid Pincode or not found');
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setError('Failed to fetch pincode details');
        }
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, [pincode]);

  return { district, state, areas, loading, error };
}
